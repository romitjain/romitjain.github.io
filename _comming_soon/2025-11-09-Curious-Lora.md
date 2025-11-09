---
layout: post
title: THe curious case of weight tying in LoRA 
category:
  - llm-optimization
date: 2025-11-09
---

One fine day, I woke up and decided to write a training loop form scratch! JK. I had a project which involved lots of customization during the training loop. So I decided to write my own trainer loop instead of using TRL or transformers trainer. Writing a training loop is pretty straightforward. Until you start adding desires. You start craving higher batch sizes, distributed training and efficient methods to manage large models. Since, I am a mortal, I too had the same desires.

I started adding complexity to my training loop bit by bit, and almost all of those complexities, came with its own baggage of bugs and unsaid features. This is one of them.

## PEFT

I wanted to use PEFT library to apply LoRA adapters to my model. However, for my specific usecase, I had to extend the vocabulary of the model, which meant updating the embedding layer and adding new embeddings corresponding to the new tokens in the embedding layer. These new embeddings are randomly initialized. To learn these embeddings during LoRA fine-tuning of the model, we have to either

1. (More common) Set the embedding layer in `modules_to_save` argument of [LoraConfig](https://huggingface.co/docs/peft/en/package_reference/lora#peft.LoraConfig.modules_to_save). This sets the complete layer as trainable.
2. (Less common) Add embedding layer in `target_modules` argument of [LoraConfig](https://huggingface.co/docs/peft/en/package_reference/lora#peft.LoraConfig.target_modules). This adds a LoRA adapter to the embedding layer.

## Weight tying

However, if you are working with a model which has its weight tied, then both of the proposed solutions runs into issues. Weight tying ties the embedding layer (input embedding layer) to the language modeling head (output embedding layer). This means that both of these layers share the weights (and the updates during training). This reduces the model size and given that both of these layers are responsible for similar things (converting tokens to embeddings), just in reverse order, a lot of models opt for weight tying (including Gemma, Granite, Llama, Qwen family of models).

Let's inspect what's the actual issue if we want to update the embedding layer (or the language modeling head) during PEFT tuning:

```bash
python -m venv .peft
source .peft/bin/activate/
# Install from main for the latest changes to reflect
pip install peft@https://github.com/huggingface/peft.git
```

## Modules to save

```python
import peft
# code to load the model and add a lora config
```

The model used above has weight tying enabled, which means its two layers `model.embed_tokens` and `lm_head` shares the parameters. Since we have added `embed_tokens` in `modules_to_save`, that layer will be marked as trainable. It will receive updates during the PEFT tuning, but we are effectively **breaking** the weight tying, since `lm_head` is not receiving any updates during the training. After the training is completed, the two tied layers will have completely diverged. What's fascinating is that the model config is not updated.

```python
# show that model config is not updated
# show that merging and unloading diverges the layers
```

A simple workaround is that we load the model in untied manner and tie the weights manually. But you know deep down, that its not the correct way! Another solve that might come to mind is adding both tied layers to `modules_to_save`. Let's see what happens, in that case.

```python
# add both layers to modules to save
```

Even in this case, both the layers are set as trainable, but the wrapper that PEFT adds on top of these layers effectively unties these layers. Both the layers receive separate updates. This breaks what you expect from tuning.


## Target modules

What if we instead add one of these tied layers in `target_modules`?

```python
import peft
# code to add one of the layers to target_modules
```

When you add a layer to `target_modules`, PEFT adds lora adapters to them. Unlike `modules_to_save`, only these adapters are updated during tuning. We see the same behaviour in this case. The Lora adapters are only added to `embed_tokens` and if you merge the model after tuning (or use it as is), the `embed_tokens` and `lm_head` have effectively diverged. The effective op from both the layers will be different.

```python
# show effective op
```

Interestingly, if you merge the model, you would see that the tying is maintained, but internally during tuning, only `embed_tokens` has seen actual updates. So the effective merging yields incorrect weights for `lm_head`. 

## Solution

Okay. So what's the solution? After spending some frutruating amount of hours on this, I figured how we could solve this and contributed a new flag `ensure_weight_tying` to PEFT, specifically for LoraConfig. Enabling this flag, solves the unexpected behaviour shared above.

```python
# code showing usage of ensure_weight_tying flag
```

