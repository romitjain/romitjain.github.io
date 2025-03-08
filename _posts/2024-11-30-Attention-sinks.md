---
layout: post
title: Attention sinks
category: [research-papers, llm-optimization]
date: 2024-11-30
---

## Attention sinks

- When training language models, the deeper layers tends to assign disproportionately high attention scores to the first few tokens in the sequence.
- Due to this, if the first few tokens are evicted or removed, the perplexity of the generations increases.
- This is a drawback for long form generations, especially for generations which exceeds the context length of the model.
    - For generations going above the context length of the model, we can either keep the KV cache of all the tokens and just add the newly generated tokens. This can lead to OOM issues or make the perplexity high.
    - The other option is to evict the initial tokens on a rolling basis.

[Arxiv](https://arxiv.org/abs/2309.17453)
