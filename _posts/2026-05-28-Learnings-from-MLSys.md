---
layout: post
title: Learnings from MLSys '26
category: [conferences, llm-optimization]
date: 2026-05-28
---

Here are my notes from attending MLSys '26. Overall I could gather the following themes from the conference:

1. Distributed training has a lot of knobs, which are really tough to manage and tune. Ton of work is being done to make it easy to manage this.
2. As training gets larger, reliability matters more. It was not surprising to see many industry talks focus on training reliability.
3. Ultra-long context lengths are getting a huge mindshare for both training and inference.
4. Heterogeneous compute (multi-region, multi-accelerator) is on the rise and is probably the next frontier of inference optimization.
5. Distributed inference still needs better auto-tuning for finding the best configs at large scale.
6. KV cache optimization, attention optimization, and quantization were already on the radar, so the number of papers on these topics was not a surprise.
7. IMO, from a skills perspective, the best thing to learn is GPU communication and networking. Learn everything around inter and intra-rack communication, NCCL, and UCCL. Lots of improvements in the coming years will come from optimizing communication between GPUs via better kernels and frameworks.

I mostly attended talks in the LLM training track, with a few talks from inference, compilers, and kernels mixed in. Follow along for summaries of some of the papers I found interesting.

## LLM training

1. [BOOST: BOttleneck-Optimized Scalable Training Framework for Low-Rank Large Language Models](https://arxiv.org/abs/2512.12131)
    1. The paper argues that LoRA in the TP regime is slower than FFT with TP. They propose to solve this by moving the TP chunk of LoRA training from (A layer 1 + B layer 1) to (B layer 1 + A layer 2).
    2. This requires updating the RMSNorm op to Online RMSNorm, where they pay for higher computation cost to reduce the communication cost, which results in overall faster training.
2. [Unleashing Scalable Context Parallelism for Foundation Models Pre-Training via FCP](https://openreview.net/attachment?id=MPVycRsIn6&name=pdf)
    1. Growing context length is a big problem in training models, especially with heterogeneous context lengths that include audio and vision tokens as well.
    2. Naive sharding on the sequence length is not always optimal, since different sequences in the batch can have different sequence lengths and different compute/memory requirements.
    3. Context parallelism is good but overshards shorter sequences in the batch.
    4. They propose to solve this via flexible context parallelism (FCP) where they divide the sequences into blocks and apply a technique similar to token binning. They also move away from the ring pattern of communication to more flexible P2P comm.
3. [ProTrain: Efficient LLM Training via Automatic Memory Management](https://openreview.net/forum?id=XDkOn0iTiH)
    1. During LLM training, there are competing things that need to be optimized (compute, memory, communication). They argue that to enable this we need better abstractions for memory, a better memory-aware profiler and automated memory management.
    2. They introduce abstractions for chunks of memory and define the whole training process in terms of these chunks. The rest of the paper is on how they optimize the training flow using these chunks by interleaving comms with compute.
    3. Based on these chunks, they also optimize the end-to-end training flow and achieve ~2x training throughput over FSDP on smaller (<1 node) scale training.
4. [Efficient Long-Context Language Model Training by Core Attention Disaggregation](https://openreview.net/forum?id=oIonqkc8hM)
    1. Similar to FCP, the paper argues that packing different-sized sequences in a batch leads to suboptimal attention computation since each sequence in the batch can have different compute requirements based on their sequence lengths.
    2. Their core observation is that attention (FA) is computed on a unit of 128 tokens and is stateless. Different such units of 128 tokens (even from different documents) can be batched together.
    3. The above introduces comm overhead. This is managed via a ping-pong schedule: pre-attention layers for batch 1, then pre-attention layers for batch 2, then core attention for batch 1 (which requires comms from pre-attention for batch 1). This is only feasible if we have multiple micro-batches of data to train on.
5. [Sparing Strategies to Minimize Reliability Impact On Large Training Jobs](https://openreview.net/forum?id=18jPgte2tM)
    1. This is a framework presented by Meta for improving large-scale training stability. When training fails and recovery time is huge, the cost of idle GPUs accumulates very quickly.
    2. If there are idle GPUs available to replace the failed GPUs, disruption can be minimal but this requires idle GPUs. They propose a framework where they keep spare GPUs in a rack to replace the failed GPUs to get better overall goodput of training. Though this framework requires very large setups to pay the cost of idle GPUs.
    3. Their metric of goodput combines training TPS x cluster size x effective training time, which is optimized by an analytical framework. For reference, a fleet of 72 GPUs with 8 intra-block spare GPUs achieves 1.02x goodput than 72 GPUs with no spare GPUs.
6. [veScale-FSDP: Flexible and High-Performance FSDP at Scale](https://openreview.net/forum?id=3Lj8R0F48P)
    1. Very dense paper presented by ByteDance Seed and IMO the best paper in the LLM training track.
    2. The authors argue that current FSDP does not work well with quantized training since quantization also includes block scale values which break with FSDP tensor boundaries. Apart from that, structure-aware optimizers like Muon require extra comms in the current FSDP implementation.
    3. They introduce the concept of RaggedShard and DBuffer.
    4. RaggedShard can shard tensors by user-defined blocks which helps with sharding quantized tensors. It also allows different devices to hold different numbers of blocks.
    5. DBuffer implements a distributed buffer that implements zero-copy communication of tensors.
    6. Zero-copy communication: Avoid copying parameter data into/out of separate communication buffers. Instead, arrange memory so communication writes directly into the final tensor storage that compute will use.
    7. Better than Megatron-FSDP at all scales of training (from 128 to 4*256 GPUs) at both throughput and peak device memory usage and achieves near-linear throughput scalability up to 8K GPUs.
7. [AXLearn: Modular, Hardware-Agnostic Large Model Training](https://openreview.net/forum?id=41x11EB3bc)
    1. A training framework introduced by Apple to support training on GPU/TPU/Inferentia with a single stack. The training stack is very modular, which makes it easy to update model architectures and support new ones.
    2. The biggest problem solved by this framework apart from multiple accelerator support is reduced changes in LoC when adding support for new model architectures. This enables them to experiment with modded architecture efficiently.
8. [GUARD: Scalable Straggler Detection and Node Health Management for Large-Scale Training](https://openreview.net/forum?id=JFEwQ821MS)
    1. A framework introduced by Amazon to improve the reliability of large-scale training jobs. They target grey nodes, nodes which pass the usual check for training but degrade in performance during large training runs. Since distributed training requires a lot of comms, even a small percentage of these grey nodes can affect the overall throughput by a big margin.
    2. The proposed solution is to continuously monitor GPU health and trigger automated workflows to repair a node once it is marked as grey (either remove, restart, or terminate the nodes).
    3. For a node to be marked as grey, several metrics like temperature, utilization metrics, and network metrics are tracked together.
9. [Pylo: Towards Accessible Learned Optimizers in PyTorch](https://openreview.net/forum?id=M9V1n4KxSd)
    1. The authors mention that there is no framework to use learned optimizers in PyTorch.
    2. A learned optimizer is an MLP that directly predicts weight updates instead of running gradient updates.
    3. This work extends PyTorch's compatibility with using learned optimizers during training and also contributes new CUDA kernels for efficient training. The optimizers are compatible with existing PyTorch `torch.optim` APIs.
10. [Beat the long tail: Distribution-Aware Speculative Decoding for RL Training](https://openreview.net/forum?id=kMeqqPBjSl)
    1. This paper is positioned to address the straggler problem in RL rollouts for sync training.
    2. The author recommends using suffix-tree-based speculative decoding instead of regular speculative decoding. This is because suffix-tree-based spec. decoding enables reuse of the prefix if the same data sample is reused again in a later epoch.
    3. Another optimization is to schedule rollouts based on the difficulty of the problems. The difficulty of the problem can be thought of as a proxy for rollout length. So for each batch the samples can contain a mix of hard/medium/easy.

## LLM Serving (Inference)/Compilers and Kernels

1. [SkipKV: Selective Skipping of KV Generation and Storage for Efficient Inference with Large Reasoning Models](https://openreview.net/forum?id=0EsV9SIm8p)
    1. To compress KV cache, usually other techniques skip tokens in KV cache. This paper introduces a methodology to skip KV tokens of complete sentences instead.
    2. The skipping criteria is based on similarity of the sentence to other sentences in the KV cache.
    3. They also introduce a method to steer KV generation (using an offline step) which helps in accuracy recovery.
    4. Results in ~6.7x less KV cache with no accuracy drop and ~10x throughput (the numbers were a bit different in the slides though).
2. [FlexiCache: Leveraging Temporal Stability of Attention Heads for Efficient KV Cache Management](https://openreview.net/forum?id=GgX6dPJx9M)
    1. The author argues that only a few KV tokens per head are important for decoding. But during every decode step, these important tokens can change.
    2. Hence, we cannot naively drop non-important tokens at a decode step since the same tokens can become important during generation at a later step.
    3. FlexiCache introduces a methodology to figure out the overlap of important tokens across the decode steps. This is applied per head per layer. If a head has high overlap of important tokens over multiple decoding steps, then only those top k tokens can be kept. This requires an offline processing step.
    4. However, not all heads show this property. Some heads have random tokens that are important over decoding steps (not overlapping). These heads are called unstable heads and are not included in the KV cache pruning process.
    5. Importantly, the unstable and stable heads are consistent across different datasets.
3. [MAC-Attention: a Match-Amend-Complete scheme for fast and accurate attention computation](https://openreview.net/forum?id=b6HBRCejb7)
    1. This paper introduces a new attention computation which is not exact to the full attention but also does not drop any token.
    2. In addition to KV cache, it also stores Q cache and attention results in the cache. When a new `q` token arrives (`n`th token), find a similar earlier `q` token (say `m`th token) from the Q cache and retrieve its corresponding attention score from cache. Rewrite flash attention computation as `Attn(n) = Attn(0 to m) + Attn(m to n)` and replace the first term from the retrieved attention score from the cache. The second term is computed as usual.
    3. Matching is done within the most recent window (eg: recent 512 tokens). The overall accuracy drop from this technique is negligible but it improves the attention computation by a huge margin, especially on larger batch sizes and larger context lengths (as much as 46x on 256K context length and 32 batch size).
    4. There are a lot of implementation details that are skipped here and mentioned in the paper.
4. [Kitty: Accurate and Efficient 2-bit KV Cache Quantization with Dynamic Channel-wise Precision Boost](https://openreview.net/forum?id=r3mQiuYKIN)
    1. Kitty enables accurate 2-bit KV cache quantization. Instead of naively quantizing every channel and every token in KV cache, Kitty adopts per-channel quant. for keys and per-token quant. for values. Critical channels are quantized in INT4, others in INT2.
    2. A local window of KV values and attention sinks are preserved in full precision.
    3. Lots of implementation details in the kernel which amortizes channel ranking (figuring out critical channels) and fused operations for dequantizations and matmuls.
    4. Easy to run with HF library with very minimal drop in accuracy (1-3%), 8x batch size support due to memory savings, and 2-4x decoding throughput.
5. [Accelerating Large-Scale Reasoning Model Inference with Sparse Self-Speculative Decoding](https://openreview.net/forum?id=yeqrwcWjPu)
    1. LRMs have expensive rollouts since they generate a large number of tokens. This paper argues that one approach is to use speculative decoding to speed up the inference. But that uses extra memory for the model and KV cache.
    2. Instead, the paper proposes using the target model itself as a cheap draft model. But instead of using full attention for the draft version, they use sparse attention with top k token selection from the KV cache.
    3. This way, they are able to share the KV cache between the draft model and the target model (since both of them are the same) and speed up inference (hence rollouts).
    4. Enabling this introduces some system-level challenges like when to schedule the GEMMs from the draft model vs verification model. More details are in the paper on how they solve this.
    5. High acceptance ratio (~6 tokens) and 2x speedup over vLLM. Even achieves higher throughput than Eagle.
6. [Optimizing Deployment Configurations for LLM Inference](https://openreview.net/forum?id=gEbKQeIdxB)
    1. Large-scale deployment of heterogeneous models is a hard problem to solve. Meta did an analysis of how to serve large heterogeneous workloads.
    2. A few learnings from their retrospective analysis:
        1. Disaggregated serving wins for online serving.
        2. Deep PP + large batches works well for offline inference, disaggregated serving does not really improve perf that much for offline inference.
        3. Can run separate parallelism strategies for prefill/decode phases. PP on prefill and TP on decode works well.
        4. MoE scaling is much better than dense with EP support. MoE also scales better in scale-out/scale-up regime.
    3. They also explored heterogeneous serving for cost savings. Assuming GPU A with high FLOPs (medium cost), GPU B with high FLOPs (high cost) + BW, and GPU C with high BW (low cost), using GPU A for prefill and GPU C for decode is cost-effective and has comparable performance.
7. [Scaling Up Large Language Models Serving Systems for Semantic Job Search](https://openreview.net/forum?id=re82zZczHj)
    1. LinkedIn built an LM for semantic job search where they found that model pruning for very specific workloads can lead to better efficiency without a high drop in accuracy.
    2. The job description had very high number of tokens which sent a huge prefill request to the LM. To reduce the number of tokens, they did RL on job description summarization to reduce the job description from >2k tokens to ~120 tokens. Further, they converted the description tokens to embedding tokens and directly used in the downstream model (reduced token count to ~50 tokens).
    3. For their workload, a lot of the requests used the same prefix. To improve speed, they computed the prefix KV from the first prompt and reused it for other sequences in the batch.
    4. Overall, they show how domain-specific problems can be solved using LM and how far you can improve the efficiency of your system given various domain-specific constraints.
8. [Event Tensor: A Unified Abstraction for Compiling Dynamic Megakernel](https://openreview.net/forum?id=PJqFhAbUHa)
    1. Decode uses >100 kernels where each kernel overhead is 1-5us. Overall this can cost 1ms per token. The authors call out the need to reduce this overhead. A possible solution is to use CUDA graphs, but even though it reduces kernel overheads, it still does intermediate HBM writes.
    2. A better solution is to design and write megakernels but it is really hard to write them. They introduce a concept of event tensor that can be used for producer/consumer patterns in megakernels. There were a few technical details that I could not understand yet and I hope to learn more by reading the paper.
9. [Search Your Block Floating Point Scales!](https://openreview.net/forum?id=innqECyZPK)
    1. The paper argues that for NVFP4, scaling the block based on max values can be suboptimal. Instead, other scaling values from the representation range of the data format can be better for reducing quantization error.
    2. The method proposed in the paper searches for alternate values for using them as scale values. Search space is limited to -2 to +6 of the max value. This scheme involves an offline step for weight quantization and dynamic quantization for activations. The approach is better for NVFP formats instead of MXFP format.
