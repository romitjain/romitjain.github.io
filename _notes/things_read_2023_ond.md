---
title: Things read in 2023 OND
tags: research-papers llms
date: 2023-12-16
---

1. TOC
{:toc}

Last 3 months, my learning curve has been pretty steep. Probably the most steep in my entire career. I thought I'd take a break from consuming all the information, reflect on what I learned, and document the same for the future.

[[Agents]]

## ASR

Related to my work

1. Major contributions of [[Whisper]] research paper
2. Whisper and it's working for long-form audio [experimentation-github](https://github.com/romitjain/whisper-longform)

## NLP

Getting to learn the field of NLP from the basics. I read a bunch of research papers and blogs. Here are my learnings from a few of them

### [Attention is all you need](https://arxiv.org/abs/1706.03762)

1. Foundational architecture which is the basis for all the current SOTA LLMs
2. Q, K, and V are matrices that are formed by linear projections (i.e multiplying by weight matrices) of input X
3. [LayerNorm](https://www.pinecone.io/learn/batch-layer-normalization/) - Mostly used for NLP tasks. For CV tasks, batch norm is used
4. Multi-head attention consists of multiple attention layers (heads) in parallel with different linear transformations on the queries, keys, values, and outputs
5. The Decoder block has cross attention where the K, V projections are outputs, but Q projections come from the encoder block
6. The Decoder block has masking and output offset by 1 position
7. Multi-head attention: Multiple projections of input so that different relationships between words are captured
8. In a typical setting, the output dimension after Q, K, and V projection is `d/h` where `d` is the input dimension and `h` is the number of heads
9. This is done so that after concatenating outputs from different heads horizontally, we get a `d` -dimension output
10. Concatenated output is again multiplied by a weight matrix ($W_{o}$)
11. The FFN has two weight matrices. FFN projects the output after attention network to `4*d` dimension and then downsizes it into `d` dimension again (hence two weight matrix)
12. Adds label smoothening which improves accuracy at the cost of perplexity (need to read more to understand why label smoothening hurts perplexity score)
13. Great resource: [The illustrated transformer by Jay Alammar](https://jalammar.github.io/illustrated-transformer/)

### [BERT](https://arxiv.org/abs/1810.04805)

1. Mostly a combination of learnings from word2vec and ELMO. Uses an encoder stack of vanilla transformers, masks words in between, and uses the network to predict the word
2. Speciality is that it uses context from both sides of the word hence the word bi-directional in **B**ERT
3. We can use the same model for multiple tasks. Why? Because the training is done in such a fashion that the model understands the complete context of the input sequence.
   1. The first token of the sentence is always a special token `<`CLS>` token. The corresponding output token of this aggregates the knowledge of the entire sentence
4. If there are more than 1 sentence in a sequence, they are separated by a special token `<SEP>`. During the forward pass, separate embeddings are added to separate sentences to indicate that these are two different sentences. This is different then positional embedding which is at a token level
5. Great resource again from Jay Alammar: [The illustrated BERT](https://jalammar.github.io/illustrated-bert/)

### GPTs

1. Decoder-only architecture. Auto-regressive in nature: Predicts one word and appends to the input and predicts next work again
2. `top_k` = How many words to take into account for every next token generation. Picks `k` words and from them, selects the words according to the probability distribution
3. Masked self-attention is different in BERT and GPT. In BERT masked tokens can take into account attention from ‘future’ tokens (or from both sides)
4. Masking is applied after query and key matrix multiplication but before applying softmax (why? need to understand this better)

### Beam search

1. In beam search, we keep on adding the scores (negative log) of each token and at each time step, take the k highest scoring one
2. The longer you go down the path (before getting a `<EOS>` token), the lower the score will become (because of a negative log)
3. The solution is to normalize the score by the number of time steps

## LLMs

Started working on LLMs professionally. Very fast-paced space which I have never experienced before. It is tough to figure out what things are noise and what will stick. I am **slower** than most in catching up in this field but I am getting deep into a few fundamental areas

### Some innovations/experimentations in LLM space

1. Multi query attention: Only have a single K, V matrix for all the attention heads. This results in a reduced number of parameters, faster training, and faster inference
2. Grouped query attention: We have shared the K, V matrix for a few attention heads. Eg: If we have 16 attention heads, we can have 4 K, V matrices, and every single pair of K, V matrices are shared amongst 4 attention heads. This was used in Llama 2
3. Needle in the haystack attacks ([ref](https://twitter.com/GregKamradt/status/1727018183608193393?t=_Td4CMfCUzGp8I0xYfdntg)). Pretty neat way to evaluate the retrieval performance of LLMs

### Zephyr

1. Zephyr included 2 main things to improve upon the Mistral model: dSFT and dDPO
2. dSFT: Use GPT4 to generate prompts and responses and directly train on this demonstration data
   1. But sometimes responses generated like this are not 'aligned' with how humans respond
3. dDPO: To align the output by the model to human responses zephyr uses a method similar to RLHF used by OpenAI
   1. They generate responses to a prompt by multiple models (say, Mistral, Claude, etc.) and use GPT 4 as an evaluator to rank them
   2. For training, get the winning response and a sample from the losing responses. Use this pair of (Prompt, winning response, losing response) to align the model
   3. Here they skip creating a intermediate reward model and directly update the main model while doing alignment
   4. They also save the cost of a human evaluating the response and use GPT 4 as the evaluator

### The power of prompting

1. [Microsoft blog](https://www.microsoft.com/en-us/research/blog/steering-at-the-frontier-extending-the-power-of-prompting/): They evaluated carefully crafted prompt techniques to beat Gemini Pro's benchmark in MMLU. According to them, specially crafted prompts can perform way better than no prompts. Prompts can significantly steer the performance of the model so much so that sometimes foundational models (which is a generalist) can beat specialized models trained for a particular task. They share an example of medical prompts used with GPT4 which could beat a specialized model trained on medical data ([here](https://www.microsoft.com/en-us/research/blog/the-power-of-prompting/))
2. Prompting also improved the performance of Anthropic's Claude model against the needle in the haystack attack ([ref](https://twitter.com/aparnadhinak/status/1736809013864472954))

### Sarvam's OpenHathi

1. All the current tokenizers do not prioritize Hindi characters because hindi tokens don't usually end up being in the top tokens
2. This resulted in issues like expensive tokenization, and slower response times since models needed to output more tokens. I evaluated that on an open source translation dataset, the same sentences required almost 4-5x the number of tokens in Hindi than in English using tiktoken
3. The first step that Sarvam did was to add 12k tokens for Hindi characters
4. TBA

<!-- ### GPUs

Oh my god, there are so many and so complex things to learn about GPUs. I didn't know where to start from. Luckily from some help from a mentor, I could start to learn more about the internals of GPUs. I still need to gain some practical experience in GPU programming.

(More to be added) -->
