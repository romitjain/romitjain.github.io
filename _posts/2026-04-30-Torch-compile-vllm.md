---
layout: post
title: torch.compile integration with vLLM
category: [llm-optimization, vllm]
date: 2026-04-30
---

This post explains how `torch.compile` is integrated with vLLM. Apart from paged attention and efficient kernels, compilation features are one of the highest leverage features of vLLM, especially **piecewise compilation**.

## torch.compile fundamentals

Before diving into vLLM's implementation, let's understand what `torch.compile` actually does at a high level and why certain patterns can be problematic.

There are multiple components of `torch.compile` and one of them is **Dynamo**, which is the frontend of `torch.compile`.

When we call `torch.compile(my_func)`, Dynamo starts tracing the wrapped function. Unlike tracers that work at the Python source level, Dynamo traces **Python bytecode**, which lets it intercept operations the interpreter is about to execute. Think of this process as a **recorder** watching your Python code execute:

```python
def my_func(x):
    y = x * 2        # Dynamo sees: multiply op
    z = y + 1        # Dynamo sees: add op
    return z         # Dynamo sees: output
```

Dynamo records these operations into an **FX graph** (like a DAG of computations), along with guards for the assumptions made during tracing. To trace the operations, Dynamo uses symbolic placeholders. For example, it can trace the operations of the above function using a tensor of shape `x: (s0, 2)`, where `s0` is a symbolic dimension we'll come back to in the dynamic shapes section.

The tracing is done once and stored as a graph. It can be reused for future inputs as long as the guards remain valid (there's a caveat here, which we'll explore later).

### Graph breaks

One requirement of Dynamo tracing is that it needs to have a fixed path through code. But sometimes during tracing, it can encounter scenarios where the code is dependent on runtime conditions. In such scenarios, Dynamo cannot trace the program into a single computational graph. It introduces a **graph break** in such scenarios. When this happens, Dynamo "breaks" the graph, compiles what it has so far, and falls back to eager Python execution.

```txt
Code with graph break:

def forward(x):
    y = x * 2              # ─┐
    z = y + 1              #  ├─> Graph 1 (compiled)
    print(z)               # ─┘ GRAPH BREAK (side effect)
    w = z * 3              # ─┐
    return w               # ─┘─> Graph 2 (compiled)

Execution: compiled → eager (print) → compiled
```

**Common causes**

| Cause                       | Example                         | Why it breaks                   |
| --------------------------- | ------------------------------- | ------------------------------- |
| Data-dependent control flow | `if x.item() > 0:`              | Can't know branch at trace time |
| Unsupported Python features | `print(tensor)`, `breakpoint()` | Side effects can't be captured  |
| Dynamic structure           | `for i in range(x.item()):`     | Loop count unknown              |
| Type coercion               | `int(tensor)`, `float(tensor)`  | Forces GPU to CPU transfer      |

Why does data-dependent control flow induce a graph break? Dynamo traces the code with a specific input (eg: `x=[1, 2, 3]`). In practice this is done with a [Fake tensor](https://docs.pytorch.org/docs/stable/user_guide/torch_compiler/torch.compiler_fake_tensor.html), which carries only metadata (shape, dtype, device) and no actual data, which is precisely why constructs like `x.item()` or `x.sum() > 0` force a break (there is no real value to read). During tracing, a particular flow can be triggered, for example in this code:

```python
def forward(x):
    if x.sum() > 0:      # <-- PROBLEM
        return x * 2
    else:
        return x * 3
```

it will take the first `if` condition during tracing. But at runtime, if we receive a different input (eg: `x=[-1, 0, -2]`), the `else` branch is activated, which was not traced at all. If it was not traced, it was also not compiled to a graph. Rather than risk an incorrect trace, Dynamo inserts a graph break here.

### Guard

When Dynamo traces a graph, it records the assumptions that made the trace valid. These runtime checks are called **guards**. If a future input violates a guard, Dynamo can trigger recompilation at runtime.

While reading about this, my immediate doubt was - why not compile all the branches and dispatch the correct one at runtime? The answer is that with more data-dependent conditions, there can be an exponential explosion of graphs to compile and correspondingly store.

```python
def forward(x):
    if cond_a(x):      # 2 paths
        ...
    if cond_b(x):      # x 2 = 4 paths
        ...
    if cond_c(x):      # x 2 = 8 paths
        ...
```

Another issue is that some conditions are computed on GPU, but the decision to dispatch happens on CPU. The result of the condition then has to be transferred back to CPU before dispatch, which hurts performance. Consider a small example:

```python
if x.sum() > 0:    # Which graph to use?
    return graph_a(x)
else:
    return graph_b(x)
```

To dispatch the correct graph at runtime:

1. Compute `x.sum()` on GPU
2. Transfer result to CPU
3. Check condition
4. Dispatch to correct graph

### Dynamic shapes

Shape-based branches are an exception. Since shape information lives on CPU, a few conditions **can** support multi-path dispatch without a GPU to CPU sync. Example:

```python
if x.shape[0] > 16:    # Shape lives on CPU, so dispatch can be decided without a GPU to CPU sync
    return graph_large(x)
else:
    return graph_small(x)
```

Dynamo provides explicit control in defining which dimension of the input should be treated as symbolic. When we mark a dimension as dynamic, Dynamo uses a symbol (`s0`) instead of a concrete value. But it may still add **guards**:

Example

```python
# Input: x with shape (batch, seq_len, hidden_dim)
#                        a       b         c

torch._dynamo.mark_dynamic(x, dim=0)      # Only 'a' is symbolic
# Result: (s0, 512, 768)  <- b and c stay concrete

torch._dynamo.mark_dynamic(x, dim=[0, 1]) # Both a and b symbolic
# Result: (s0, s1, 768)   <- only c is concrete
```

For a given model architecture, the hidden dimension is fixed and thus can be treated as static for tracing and compilation. [PyTorch guide](https://docs.pytorch.org/docs/stable/user_guide/torch_compiler/torch.compiler_dynamic_shapes.html) is a good starting place to learn more about dynamic shape support in `torch.compile`.

> **Note: Guards with dynamic shapes**
>
> Dynamo may still add guards even when using dynamic shapes. Typically, with `mark_dynamic(dim=0)` tracing on a tensor of shape `(s0, 768)`, Dynamo would add guards like:
>
> 1. `s0 >= 2` (Dynamo specializes 0 and 1 by default)
> 2. `type(s0) == int`
>
> The exact guards have shifted across PyTorch versions. If any of these conditions fail at runtime, a recompilation is triggered.

## vLLM integration with torch.compile

Now, armed with the knowledge of Dynamo tracing, graph breaks, guards and dynamic shape support for compilation, we can understand how vLLM uses `torch.compile`.

vLLM's compile modes are designed to avoid serving-time recompilation, including by removing guard checks in trace-once paths. This is important, because vLLM's primary focus is to achieve the best possible throughput and latency for LLM inference.

vLLM has also built a framework for piecewise compilation. It uses Dynamo to trace the full forward pass into a single graph, and then splits that graph at a configured list of **splitting ops** (primarily attention) which need to run in eager mode. Note that this is vLLM's own splitting mechanism layered on top of a clean Dynamo trace, not the same thing as Dynamo's graph breaks. Every region between splitting ops is compiled, and the splitting ops themselves run eager.

```ascii
Full graph with multiple custom ops:

+------------+    +------------+    +------------+    +------------+
|  rms_norm  | -> | attention  | -> |  silu_mul  | -> |  rms_norm  |
| (custom op)|    | (custom op)|    | (custom op)|    | (custom op)|
+------------+    +------------+    +------------+    +------------+
      |                 |                 |                 |
      v                 v                 v                 v
  COMPILED         SPLITTING OP       COMPILED          COMPILED
  (in graph)       (runs eager)       (in graph)        (in graph)


After split_graph():

+------------+    +------------+    +-------------------------+
|  submod_0  |    |  submod_1  |    |        submod_2         |
| (rms_norm) | -> | (attention)| -> | (silu_mul + rms_norm)   |
|  COMPILED  |    |   EAGER    |    |        COMPILED         |
+------------+    +------------+    +-------------------------+
```

If two splitting ops are back-to-back, they're grouped together:

```ascii
Before:  [norm] -> [attn_a] -> [attn_b] -> [mlp]

After:   [submod_0: norm] -> [submod_1: attn_a + attn_b] -> [submod_2: mlp]
                                    (both eager)
```

The ops that can split the graph can be controlled via config. vLLM re-implements crucial ops like SiLU and RMSNorm, but they still remain compile-friendly.

Usually, vLLM runs attention-related ops in eager mode. Within a batch, sequences have different lengths, so many shape-dependent decisions happen at runtime, which makes attention hard to capture in a single static graph. Nevertheless, vLLM implements very efficient kernels for attention. The attention op is registered as a custom op with a fake/meta implementation, which is what allows Dynamo to trace through it without breaking. In the final graph, attention is just treated as a black box.

During compilation, vLLM compiles for various static and dynamic shapes and caches the output of `torch.compile`. This on-disk cache holds the Inductor-compiled artifacts (Triton kernels, etc.) and can be reused for faster startup of new services serving the same model. CUDA graphs are a separate, runtime-only mechanism: they are captured per-process for compiled pieces at different batch sizes and are not portable across processes.

During runtime, each compiled subgraph gets a `PiecewiseBackend` that selects the right kernel based on batch size:

```
PiecewiseBackend for submod_0:

+---------------------------------------------------------+
|  compile_ranges: [(1, inf)]   # General symbolic kernel |
|  compile_sizes:  [1, 2, 4, 8] # Optimized specific sizes|
|                                                         |
|  Stored kernels:                                        |
|    Range(1,inf) -> fn_symbolic  (works for any size)    |
|    Range(1,1)   -> fn_size_1    (optimized for size=1)  |
|    Range(2,2)   -> fn_size_2    (optimized for size=2)  |
|    Range(4,4)   -> fn_size_4    (optimized for size=4)  |
|    Range(8,8)   -> fn_size_8    (optimized for size=8)  |
+---------------------------------------------------------+
```

**Dispatch logic:**

```ascii
Runtime: batch_size = 4

    Is 4 in compile_sizes?
           |
       +---+---+
       |       |
       v       v
      YES      NO
       |       |
       v       v
 Use fn_size_4   Use fn_symbolic
 (auto-tuned)    (general kernel)
```

Putting it all together, if we take a look at end-to-end compilation of a model in vLLM:

```ascii
Input: Model

Step 1: vLLM triggers compilation
------------------------------------------------
  |
  |--> mark_dynamic(input_ids, dim=0)  # batch dim is s0
  |--> drop all guards
  |
  |--> Dynamo traces forward():
  |     * embed(input_ids)           -> [s0, 2048]
  |     * rms_norm(...)              -> [s0, 2048]  (custom op, stays in graph)
  |     * attention(...)             -> [s0, 2048]  (custom op, SPLITTING)
  |     * silu_and_mul(...)          -> [s0, 2048]  (custom op, stays in graph)
  |     * ... (repeat 16 layers)
  |
  |--> split_graph() at attention ops:
  |     * submod_0: embed + norm           (COMPILE)
  |     * submod_1: attention              (EAGER)
  |     * submod_2: mlp + norm + attention (COMPILE)
  |     * ... etc
  |
  |--> Inductor compiles each subgraph:
  |     * Generates optimized Triton kernels
  |     * Kernels work for any s0 (symbolic)
  |     * Also compiles specific sizes [1,2,4,8] with autotuning
  |
  +--> CUDA graphs captured for compiled pieces

Step 2: Subsequent forward passes
---------------------------------
  |
  |--> batch_size=4:
  |     Dispatch to fn_size_4 (optimized)
  |     Replay CUDA graphs
  |
  |--> batch_size=7:
  |     No exact match, use fn_symbolic (general)
  |     Replay CUDA graphs
  |
  +--> batch_size=1:
        Dispatch to fn_size_1 (optimized)
        Replay CUDA graphs

No recompilation on the serving path for supported shapes/configurations.
```

This is the core idea: vLLM uses `torch.compile` where compilation gives predictable wins, keeps attention and other unsafe regions outside compiled graphs when needed, specializes hot batch sizes, and replays cached CUDA graphs to reduce runtime overhead. Piecewise compilation is what makes `torch.compile` viable for a workload as dynamic as LLM serving.

## References

- [vLLM Compile Deep Dive](https://www.youtube.com/watch?v=qLtCDI6XOzg)
