---
layout: post
title: LLM Inference Part 1
category: [research-papers, llms]
date: 2024-11-28
---

This is an ever evolving post on LLM inference (mostly on GPUs). It covers references/explainations around these topics:

1. [Orthogonal improvements](#orthogonal-improvements)
2. [References](#references)
3. [Links](#links)

## Orthogonal improvements

1. Paged Attention
2. Chunked pre fill
3. Prefix caching
4. Flash decoding and Flash Attention
5. KV Caching and compression
6. Attention sinks
7. Batching [^1]

## References

1. [Building Machine Learning Systems for a Trillion Trillion Floating Point Operations](https://www.youtube.com/watch?app=desktop&si=t_eb7RqLVsz0wmJ-&v=139UPjoq7Kw&feature=youtu.be)

## Links

[^1]: [Scheduler policy in vLLM vs TensorRT](https://blog.squeezebits.com/vllm-vs-tensorrtllm-4-which-scheduler-wins--33083)
