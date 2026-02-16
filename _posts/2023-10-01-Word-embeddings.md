---
layout: post
title: Word Embeddings
category: [deep-learning]
date: 2023-10-01
---

# Word2Vec

## Notes

1. Softmax is used to squash arbitrary range of values to a probability distribution b/w values of $[0, 1]$
2. Word2Vec actually trains two vectors for each word, one when it appears in center and other when it appears in context (outside). The final output is the average of both the embeddings
3. Word2vec is a **bag of words** model -> it doesn't care about the order of the words
4. There are two variants of word embedding models
	1. Skip gram - Predict context word given centre word
	2. Continuous bag of words (CBOW) - Predict centre word given context words

### Training efficiency

1. The loss function of the word2vec model includes two terms
	1. Numerator which focuses on decreasing the loss function when embedding of centre word and outside word are similar
	2. Denominator which focuses on decreasing the loss function when embedding of centre word is dissimilar to other words in the vacobulary
		1. This computation is pretty slow because we have to calculate this for every centre word with every word in the vocab
		2. To optimize this calculation we update the loss function to sample words from the vocabulary against which the centre word optimizes to be dissimilar
		3. This is called **Negative-sampling**

## Co occurrence matrix

* Why not just have co occurrence matrix with a small window length
	* Vectors increase in size with vocab., very high dimensional
* One possible solution is to reduce the dimension of the matrix by methods such as SVD
* Disproportionate importance to high frequency words

## GloVe

![[../assets/images/glove.png]]

- Ratio of co occurrences probabilities encode meanings
- How can we learn just meanings? Idea is to change the probability function to capture co occurrence

## References

1. [CS224N lecture 1 and 2](https://www.youtube.com/watch?v=rmVRLeJRkl4&list=PLoROMvodv4rOSH4v6133s9LFPRHjEmbmJ&index=1&pp=iAQB)
