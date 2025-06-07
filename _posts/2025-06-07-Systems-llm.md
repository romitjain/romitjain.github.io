---
layout: post
title: What is Systems for LLM
category: [notes-to-self]
date: 2025-06-07
---

## Systems for LLMs

This year, I decided to focus on systems for LLM. This was not an immediate decision but a reflection on 2024 and my past career. But what do I mean by systems for LLM?

Simply put, it involves building frameworks that facilitate the training and deployment of large models. It spans across 3 layers:

**Hardware layer**

Understand the hardware deeply and write hardware-aware programs. For Nvidia hardware, you can’t compete with internal people at Nvidia. They know the hardware the best and will always be positioned to write the best general-purpose kernels. However, there is an opportunity outside to do impactful work, specifically in the algorithms and architecture domain. If you move to different hardware (AMD, Intel, etc.), the gains are much, much more. Examples of frameworks: [TorchAO](https://github.com/pytorch/ao), [Gemlite](https://github.com/mobiusml/gemlite/), [Liger](https://github.com/linkedin/Liger-Kernel), [Cutlass](https://github.com/NVIDIA/cutlass)

**Orchestration layer**

Frameworks that can handle the orchestration of tensors. This means making the best use of the hardware from a scheduling and optimization perspective. This is the crucial layer that bridges the hardware with the end goal (distributed training and inference). This results in building efficient frameworks for either training, post-training, RL, or inference. This is the highest ROI and most interesting area personally to me. Examples of frameworks: [vLLM](https://github.com/vllm-project/vllm), [SGLang](https://github.com/sgl-project/sglang), [Torchtune](https://github.com/pytorch/torchtune), [Unsloth](https://unsloth.ai/), [axolotl](https://github.com/axolotl-ai-cloud/axolotl)

**Deployment layer**

Deploying models using the above frameworks in production. This means managing the instances of the deployed framework by autoscaling, building a monitoring and observability stack. In the LLM era, this also means building a KV cache-aware routing, disaggregated serving, KV cache store, etc. Examples of frameworks and tools: [llm.d](https://github.com/llm-d/llm-d), [Nvidia Dynamo](https://developer.nvidia.com/dynamo)

Every layer is heavily influenced by the layer before it. And in the LLM era, every layer is getting redefined. Right now, my interest lies mostly in (2) and (1).

Why do I like this?

1. I like programming and building stuff  
2. I like to optimize things, reduce wastage, and run them at scale  
3. I just don't want to be a recipe curator  
4. Architecture may change, but the scale can never go back; it will always be of value to optimize, adapt, and improve systems

Possible research avenues

1. Optimizations around KV cache, for example: [Paged Attention](https://blog.vllm.ai/2023/06/20/vllm.html), [KV cache compression](https://arxiv.org/pdf/2506.05345)  
2. Optimizations around reducing memory footprint, for example: [Smoothquant](https://arxiv.org/pdf/2211.10438), [SwiftKV](https://arxiv.org/pdf/2410.03960v2)  
3. Efficient scheduling, speculative decoding, and batching, for example: [Chunked prefill](https://arxiv.org/pdf/2308.16369), [Distserve](https://arxiv.org/pdf/2401.09670)  
4. Hardware-aware algorithms, for example, [Flash attention](https://arxiv.org/pdf/2205.14135), [Flash decoding](https://pytorch.org/blog/flash-decoding/)

The kind of impact I want to have

1. The framework should facilitate critical flows like model training and large-scale inferencing, and should help save money based on the optimizations  
2. The framework helps in building real products that have an edge, specifically because of the optimizations and resilience
