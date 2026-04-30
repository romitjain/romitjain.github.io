---
layout: post
title: Likelihood Estimation
category: [machine-learning]
date: 2022-03-15
---

## Motivation

- Important to understand from the perspective of cost functions
- Likelihood vs Probability and Probability density

## Goal

- The goal of maximum likelihood is to find the optimal way to fit a distribution to the data
- We want to fit a distribution to the data so that we can generalize the data and it makes it easier to work with the dataset
- We are trying to find a PDF something like: $p(x, \theta)$ where $\theta$ is the model parameters and $x$ is the dataset.
       - We want the maximum of this function for the mean and variance of the distribution (not the data)
- Likelihood means that we are trying to find the optimal value of mean, standard deviation (or other measures) for a distribution given a bunch of observed measurements
- One way to interpret MLE is to view it as minimizing the "closeness" between the training data distribution $p_{data}(\textbf{x})$ and the model distribution $p_{model}(\textbf{x}, \boldsymbol{\theta})$. The best way to quantify this "closeness" between distributions is the KL divergence
- Maximizing the likelihood is equivalent to minimizing the KL divergence

## Mathematical derivation

## Principles

1. Guaranteed events have no information
2. Pure randomness has maximum information
3. As you increase chaos, you get more information

## Information

$I(x) = -\log{P(x)}$
This represents information of an event

## Entropy

Entropy measure the number of bits required to encode the information

- $H(x) = E_{x}[I(x)]$
- $H(x) = -\sum_{x}{P(x)\log{P(x)}}$

## Cross entropy

Minimum number of bits to encode $x$ with distribution $P$ using the wrong optimized encoding scheme from $Q$

- $H(P, Q) = -\sum_{x}{P(x)\log{Q(x)}}$
- $P(x)$ is the distribution of true labels
- $Q(x)$ is the prediction from the model

## KL divergence

Difference between two distributions P andQ

- $D_{KL}(P||Q) = E_{x}\log\frac{P(x)}{Q(x)}$
- $D_{KL}(P||Q) = \sum_{x}P(x)\log\frac{P(x)}{Q(x)}$

Using above 3 equations from KL divergence, cross entropy, and entropy, we will get

- $H(P, Q) = H(P) + D_{KL}(P||Q)$
- When minimizing the above function wrt. model parameters $H(P)$ can be considered constant. So it will convert to minimize KL divergence.

> Maximizing the likelihood is equivalent to minimizing the KL divergence

## Maximum Likelihood estimation (MLE)

- MLE maximizes $p(y|x;\theta)$
- $\hat{\theta} = argmax \prod_{i}^{N} {p(x_{i} | \theta)}$
- Instead of maximizing the above function, we minimize the negative log of the function which is equivalent
- $\hat{\theta} = argmin -\sum_{i}^{N}\log({p(x_{i})|\theta})$ -> This is called negative log likelihood (NLL)
- NLL and minimizing cross entropy is equivalent (refer reference 3)
       - $\hat{\theta} = argmin\space H(p, q)$

## Mean square error

- In regression problem we assume a normal distribution and define the log likelihood function
- After plugging in the values of normal distribution assumption in likelihood equation, we get MSE

## Reference

1. [Statequest](https://www.youtube.com/watch?v=XepXtl9YKwc)
2. [AI Summer](https://theaisummer.com/mle/)
3. [Blog 1](https://jhui.github.io/2017/01/05/Deep-learning-Information-theory/)
4. [Blog 2](https://leimao.github.io/blog/Cross-Entropy-KL-Divergence-MLE/)
