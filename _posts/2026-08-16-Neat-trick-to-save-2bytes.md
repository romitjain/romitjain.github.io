---
layout: post
title: Neat trick to save 2 bytes!
category: [llm-optimization]
date: 2026-08-16
---

There's a free lunch hiding in LLM training optimization. It’s a neat little trick that saves 2 bytes per parameter during BF16 mixed-precision training.

## Parameter memory

In BF16 mixed-precision training, the model uses BF16 parameters during the forward pass, while backward pass updates an FP32 master copy. FP32 preserves optimizer updates that may be too small to change a BF16 value after rounding. Keeping FP32 master weights is also common during FP16 training.

Together, these parameter copies require:

* BF16 model parameter: 2 bytes
* FP32 master parameter: 4 bytes
* Total: 6 bytes per parameter

This relationship gives us an opportunity to eliminate some redundancy. Note that BF16 has a useful relationship with FP32:

* FP32: 1 sign bit, 8 exponent bits, 23 fraction bits
* BF16: 1 sign bit, 8 exponent bits, 7 fraction bits

BF16 is effectively the upper 16 bits of the FP32 bit layout. If we split an FP32 value into two 16-bit parts:

![bf16-in-fp32](/assets/images/bf16_in_fp32.png)

Master weights are only used during the backward pass. The fused Adam kernel in Transformer Engine reconstructs the FP32 master weight from the BF16 parameter and the `int16` remainder, applies the update, and then separates the updated value into BF16 and remainder components again.

This means we don't need to store the FP32 master weights separately. Instead, we store the same 4-byte value as two 2-byte components. This requires 4 bytes per parameter instead of 6, saving **2 bytes per parameter**.

For a 30B-parameter model, this saves **60 GB of VRAM** during training. For a distributed training, per-GPU savings depend on how the parameters and optimizer state are sharded. If both are fully sharded across $N$ GPUs, each GPU owns $P/N$ of the model's $P$ parameters and saves:

$$
2 \times \frac{P}{N}\text{ bytes per GPU}
$$

Equivalently, this optimization saves 2 bytes for every parameter owned by that GPU.

### How it is stored in checkpoints

* **Model state:** the BF16 parameter is saved as the model weight.
* **Optimizer state:** the trailing 16 bits are saved as an `int16` master-weight remainder, alongside the Adam moments and optimizer step metadata.

A full training checkpoint needs both the BF16 parameters and the `int16` remainders to resume the exact FP32 optimizer trajectory. A model-only checkpoint needs only the BF16 parameters and is sufficient for inference, but it discards the trailing bits.

### Sources

* [Megatron optimizer configuration](https://github.com/NVIDIA/Megatron-LM/blob/main/megatron/core/optimizer/optimizer_config.py)
* [Megatron optimizer construction](https://github.com/NVIDIA/Megatron-LM/blob/main/megatron/core/optimizer/__init__.py)
* [Transformer Engine FusedAdam](https://github.com/NVIDIA/TransformerEngine/blob/main/transformer_engine/pytorch/optimizers/fused_adam.py)
