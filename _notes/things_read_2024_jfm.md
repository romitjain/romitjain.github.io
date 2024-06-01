---
title: Things read in 2024 JFM
tags: research-papers LLMs computer-vision multimodal agents
date: 2024-02-02
---

1. TOC
{:toc}

## CodeLlama

What's special about CodeLlama? How was its training process different?

1. Infilling, which enables real-time completion in IDEs. This is where you try to predict text given the surrounding text. This is different from autoregressive training where only the next word is predicted
   1. The complete document is split based on character level into the prefix, middle, and suffix. The splitting location is sampled randomly
   2. 2 formats are prepared, SPM (Suffix prefix middle) and PSM. Special tokens are added to mark the beginning of all three parts
   3. More details are presented [here](https://arxiv.org/abs/2207.14255)
2. Long context finetuning: Training with an extended number of tokens by updating RoPE parameters
3. While training they sample from natural language datasets as well to help the model retain its conversational abilities and language understanding abilities
4. While training the instruct model, they use Llama to generate the coding prompt and the non-instruct model to generate the code for that
   1. Then, used code execution feedback to select the training dataset for the instruct model

## Mixture of Experts (MoEs)

MoEs are all the rage nowadays!

1. The major advantage of MoEs is that you can dramatically increase the parameters of the model (hence maybe the learning capacity) while maintaining lower inference cost
2. In MoEs, we have a router layer and a duplicated regular layer (feed-forward layer). This regular layer can be duplicated `e` number of times (in Mixtral it is 8)
   1. What this basically means is that we have a weight matrix for the router layer which is of the size (`d x e`) where `d` is the hidden dimension and `e` is the number of experts
   2. The router layer decides which of these duplicated layers should the forward pass go to. This is learned during training.
   3. Usually, K layers are chosen to route the forward pass instead of only 1. We take a weighted average of the outputs of these K layers
   4. Why top K instead of 1? I think it is to enforce diversity and prevent rich-gets-richer scenarios where 1 of the duplicated layers gets all the updates
3. Mistral achieves higher throughput by using a strategy called Expert Parallelist where each expert (duplicated) layer is hosted on separate GPUs. Hence, for that GPU the utilization is high and we get K operation in parallel

### References

1. [Mixtral research paper](https://arxiv.org/abs/2401.04088)
2. [Mixtral of Experts (Paper explained)](https://www.youtube.com/watch?v=mwO6v4BlgZQ)

## [[Agents]]

A few advancements in LLM-powered agents. This space is rapidly evolving and most of what is written here might be outdated in a year.

### ReAct

- Ask the LLM to
    - Observe the environment (the task and environment status after executing an action)
    - Think through the actions required to move toward the goal
    - Act in the environment (this can be a proprietary API, function calling, or code)

### AppAgent

LLM-based agents use a smartphone app to achieve goals

- Based on the ReAct framework, but adds the screenshot of the app page
- Exploration phase
    - The Key to learning is: observing how our actions impact the world
    - A goal is given and then the agent performs some actions
    - Give a before image, and an after image and ask it to reflect on what happened
    - After the explorations stage, LLM creates a doc for the app which defines how the app works and what UI elements do what
    - This document can evolve and explain the functionality of the UI buttons
- Deployment phase
    - Give me a high-level task, document, and a DSL
    - Observe, Think, Act, and Summarize
    - The LLM also receives a history of it's actions
- Actions
    - The key contribution is how to give good navigation skills to GPT4V since GPT4V is not good at UI navigation
    - Process UI elements and overlap on the screenshot
    - They also send XML input of interactive elements to ground the results
    - GPT4V understands the UI pretty well but it is not good at pixel viewing, meaning it can't tell the exact co-ordinates of an element
        - 2% success vs 40% when XML elements are used
        - Instead of doing (x, y) co-ordinates move, they provide a simple DSL
- Results
    - DSL FTW
    - Documentation (basically memory) improves the performance. The better the quality of the documentation, the better the performance

#### References

1. [Paper discussion](https://www.youtube.com/watch?v=U07rxKenYc4)
2. [GitHub](https://github.com/mnotgod96/AppAgent)

### MobileAgent

Similar to [AppAgent](#appagent) but instead of using XML to select the elements, it asks GPT which button to click on.

1. (-) Does not have memory
2. (+) Can do more actions
3. (+) Does not depend on BBOXes which can be a hit-or-miss
4. (-) Depending on icons and text matches using other models (can be slower than other methods)

### Synapse

Mentions that ICL (in context learning) is limited in long horizon tasks due to various factors

1. Complex things also passed in context
2. Context length limitations
3. Not good generalization across tasks

It builds on 3 things

1. State abstractions - Basically means that it cleans the environment before sending it to the agent
2. Trajectory as exemplar (TaE) prompting - A RAG of previous successful paths
3. The memory of previous successful paths

## Multimodal

https://twitter.com/khoomeik/status/1753511199877333254

### Llava

### CogAgent

### Fuyu

## Misc concepts

### Speculative decoding

### Action models
