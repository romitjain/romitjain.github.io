---
layout: post
title: Quantization
category: [research-papers, llms]
date: 2024-11-28
---

This post is about language model quantization

1. [Quantization](#quantization)
   1. [Weight only quantization](#weight-only-quantization)
2. [References](#references)

## Quantization

2 things to remember in quantization:

1. Quantization Schemes: Schemes are the mathematical ways of quantizing a model. eg: AWQ, GPTQ
2. Quantization Kernels: Kernels are implementations of schemes in different settings (batched load, non batched load etc.). eg: ExLlama v2, Marlin

The schemes also release their official kernels where they implement their own kernels. However, over time, others figure out ways to improve the computation and weight loading. For example, Marlin kernels are efficient implementations for FP16xInt4 which are used in 4 bit weight only quantization and can be applied for both GPTQ or AWQ.

Going deep in these schemes and kernels will make one realize that choosing the right quantization scheme is extremely nuanced. Ideally, to compare performance, we should look at (kernel x batch size x scheme x workload) comparisons.

### Weight only quantization

- Weight only quantization is good, but only helps in reducing memory bandwidth load [^3] [^4]
- If the model is operating in the compute bound region (eg: during pre fill [^1], high batch size), weight quantization does not help much. The model loads the weights only once and does large number of computations. For these computations, the kernel needs to de quantize the model weights which are quantized. This step adds a computational overhead.
- But, if the model is operating in memory bound region (eg: while decoding), weight quantization is extremely helpful. It becomes more helpful with the increasing model size.
- Given this knowledge, it can be inferred that for a batch size of 1, the pre fill phase will be compute bound and decode phase will be memory bound
- Since, due to quantization we can typically serve more number of requests in the same memory, the *effective* throughput of the model be increased. The effective throughput is number of tokens generated for all the requests in the batch combined.

TBA some experiments with gpt-2

<!-- Let's walk through an example to see the effect of weight only quantization: -->

<!-- for batch size = 1, llama 1b, int4 quant, int8 quant, fp16 baseline -->
<!-- example to show performance boost in pre fill heavy workloads for different weight quant. schemes -->
<!-- example to show performance boost in decode heavy workloads for different weight quant. schemes -->

Learnings

- Compute bound (pre_fill, high batch size) -> weight only quantization is meh!

## References

[^1]: During pre-fill, if the number of pre-fill tokens are high, the number of FLOPs required are quite high. According to kiply's inference arithmetic [^2], it is $24*l*n*d^2$ (for GPT-2 style models) where $n$ is number of pre-fill tokens, $l$ is number of layers and $d$ is the dimension of the hidden layers.
[^2]: Kiply's inference arithmetic
[^3]: [vLLM vs TensorRT on weight only quantization](https://medium.com/squeezebits-team-blog/vllm-vs-tensorrt-llm-6-weight-only-quantization-0fbd73f3b597)
[^4]: [vLLM vs TensorRT on weight activation quantization](https://medium.com/squeezebits-team-blog/vllm-vs-tensorrt-llm-7-weight-activation-quantization-331cf9eadc0d)
[5]: [Optimizing ai inference at Character AI](https://research.character.ai/optimizing-ai-inference-at-character-ai-part-deux/)
