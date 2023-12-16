---
title: AST Audio Spectrogram Transformer
tags: research-papers deep-learning
date: 2022-03-23
---

1. TOC
{:toc}

## Introduction

- Maps audio spectrograms to labels
- Improves on CNN-attention hybrid model
- Achieves state of the art mAP
- Largely used ViT transformer architecture with weights of the DeiT model trained on ImageNet to build a purely attention based model for audio classification.

## Architecture

- Convert audio waveform of `t` seconds to `128 x 100t` spectrogram
- Take `16x16` patch size with an overlap of 6 in both time and frequency domain
- Number of patches: `N = 12[(100t - 16)/10]`
- Flatten 16x16 path to a 1D embedding of dimension 768 (use a vanilla neural network)
    - Add trainable positional embedding (same size)
- Transformer architecture is applied on `Nx768` input embedding
- Architecture is broadly borrowed from the famous [[Vision Transformer]] (ViT).
- Take pre-trained ViT on ImageNet (encoder block)
    - For ViT, input is 3 dimensional image while for AST it is 1 dimensional. Average weights for all 3 channels and use them for AST patch embedding layer.
    - Positional embeddings are also fixed (not clear to me how)
    - Remove the final classification layer of ViT, and use pre-trained DeiT weights

## Benefits

1. Performant
2. Supports variable length inputs because audio is converted to spectrograms which are of fixed dimension irrespective of audio length
    1. However, if we use spectrograms in CNN based models, this is not an advantage
3. Simpler architecture: Converges faster

## Experimentation

1. Experimentation on AudioSet dataset
    1. Average weights of all the checkpoint models
    2. Run training multiple times with same settings but different random see. Average weights of the last checkpoint model
    3. Run training multiple times with different settings and average wrights of the last checkpoint model
2. Increasing patch size improved accuracy but would lead to increase in computational complexity. Increasing patch size will result in more number of patches which will raise the computational complexity quadratically.
3. Training with frequency and time masking, mixup, augmentation and random noise

## References

1. [Arxiv](https://arxiv.org/abs/2104.01778)
