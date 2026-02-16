---
layout: post
title: Batchnorm
category: [deep-learning]
date: 2023-07-17
---

# Batchnorm

1. Used to reduce the shift of values in each layer in deep learning network
2. Calculate $\mu$ and $\sigma$ of each feature in a mini batch
3. Normalize the input features by the calculated $\mu$ and $\sigma$
4. There are two learnable parameters scale ($\gamma$) and shift ($\beta$)
5. Compute a moving average across all mini batches seen during training and use them during inference

## Advantages

1. Faster training and convergence
2. Can use higher learning rate
3. Reduced sensitivity to weight initialization
4. Regularization

## References

1. [AI Summer](https://theaisummer.com/normalization/)
