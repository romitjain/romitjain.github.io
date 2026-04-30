---
layout: post
title: Cutlass primer
category:
  - llm-optimization
  - gpus
date: 2026-03-16
---

## CUTLASS

I have been trying to understand various libraries in the CUDA ecosystem. This is my ever-evolving document on learnings related to CUTLASS.

## Detour - refresher on C/C++ concepts

- C has function declaration in `.h`, can be defined with separate definition in `.c` or as `inline`
- Large inlines can bloat the binary - compiler already optimizes this
- C does not support parameter overload
- Templates in C++ allow this, declare one function with a type parameter, compiler generates different versions at compile time
- Templates live in header files
- Example of how templates look like:

```cpp
template <typename DataType, int tile_size>
DataType matmul(DataType a, DataType b) {
    ...
}
```

```cpp
Tensor<float32> A(3, 2);
Tensor<float32> B(2, 3);
matmul<float32, 16>(A, B);   // compiler links to float32 version

Tensor<bfloat16> A(3, 2);
Tensor<bfloat16> B(2, 3);
matmul<bfloat16, 16>(A, B);   // compiler links to bfloat16 version
```

## Primer - What is CUTLASS

- NVIDIA's open source header-only C++ template library for writing high perf GEMM kernels
- Why header-only?
    - Just select the datatype, and other parameters (like tile size) and the compiler can generate and link to the correct kernel based on the input parameters
- GEMMs performance depends on the datatype, gpu arch., parameters like tile size and strategies used such as split K, epilogue fusion. All of these performance knobs are available in CUTLASS since it's templated
- Comparing to cuBLAS, CUTLASS offers much more customization. cuBLAS has pre-compiled binaries which can be used as black-box

## Usecase in PyTorch: How `torch.compile()` can use CUTLASS to find the best kernel

Reference: [CUTLASS Backend for Inductor (PyTorch Compiler Series)](https://www.youtube.com/watch?v=2dY8vPQ349Q)

1. `torch.compile()` can make use of CUTLASS backend for auto-tuning the performance of the kernels
2. CUTLASS exposes an API that lists all valid combos of tile sizes, stages, data types, alignments, etc. Inductor (from `torch.compile`) uses heuristics to narrow this to "known good ranges"
3. All relevant candidates from (2) are compiled in parallel to separate `.so` files. This process takes time due to C++ template compilation process (dont understand this fully yet)
4. Compiled kernels are timed on the target hardware with some dummy data. The complete setup (list of kernels and benchmark results) are cached. This cache can be used later for same GEMM shapes+hardware setup
5. In autotuning, these are the parameters that gets tuned
   1. Tile size
   2. Number of pipeline stages
   3. Dtypes
   4. Memory alignments
   5. Warp specialization
   6. TMA use: Async mem transfer, helps in epilogue fusion
6. CUTLASS internally handles epilogue fusion by implementing an AST and processing it. There is some work in Inductor too, to enable this - but I am skipping that since that is not the overall goal of understanding right now
7. If `dynamic=True` in `torch.compile` then shapes are used as runtime args. CUTLASS does not benchmark for specific shapes and there can be a small performance gap compared to static shapes
