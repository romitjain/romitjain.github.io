---
layout: post
title: ML for fraud detection
category: [machine-learning]
date: 2022-12-01
---

## 3 types of broad features
1. Account related features
2. Transaction related features
3. Customer related features

## Major challenges
### Class imbalance for fraud detection

Cost sensitive methods
- Loss function level
- Imbalance ratio: ratio of samples belonging to minority class and majority class
- Problems
	- Small sample size
	- Class overlap
	- Noisy or borderline instances
- Can consider misclassification cost as a hyperparameter as well
- Balanced accuracy
- Can lead to a lot of false positives, affective precision

Resampling methods
- Data level
- Oversampling
	- Random duplication (Naive)
	- SMOTE
	- ADASYN
- Undersampling
	- Random undersampling
	- Edited nearest neighbor
	- Replacing subsets by samples of their centroid
- Hybrid
	- Almost always improves performance
	- SMOTE + Nearest neighbour - Tomek links

Sampling can generally be beneficial to AUC ROC, but leads to decreased performance in average precision.

1. Concept drift
3. NRT systems
4. Categorical features transformation for fraud detection
	1. Converting timestamp
		1. Weekend/Weekdays
		2. Day/Night
	2. Converting customer id/terminal id to:
5. Rolling window: Average and number of txns in the rolling windo
6. Sequential modeling
7. Class overlap
8. Performance measures
9. Lack of dataset (addressed by [[Data simulation for fraud detection]])

## Training
1. Delay in train/test set

## Model validation
Evaluate the trained model on validation dataset and tune the performance

- Hold out
	- Sensitive to the dataset
- Repeated hold out
	- Only subsets of data are used for training
- Prequential validation
	- Fixed test set
	- Moving test set
	- Computationally expensive
	- More testing so more general results
	- Also gives confidence intervals

## Model selection
1. Training vs validation/test model performance tradeoff
2. Performance summary
	1. Default parameters
	2. Estimated parameters - Parameters on validation dataset
	3. Optimal parameters - Parameters on test dataset
3. Random grid search

## Neural networks for fraud detection

- Instead of using only tree based and NNs, use an ensemble of both.
- Need to scale input for NNs
- Usually tree based are used in real world scenarios

### Shortcomings of tree based models

- Use overall data to compute splits
- Meaning they don't learn iteratively
- Have to create aggregate features, requiring expert human knowledge and time
	- NNs can represent features and do classification in one go

### Advantages of learning iteratively

- Can learn on newer dataset only instead of learning on all data everytime
- No need to store older data once learning is complete
- NN can learn per sample and iteratively hence the benefits over tree-based models
- Federated learning is possible in NNs

### Auto encoders and anomaly detection

- Can use autoencoder techniques for generating a embedding of the input representation
- For autoencoders, we will use the MSE loss
- Encode all the txns (both fraud and genuine). Higher MSE loss will signify a fraud (rarer) txn
- Embedding from the txns can also be used to cluster visualization
- We can also combine the results of unsupervised learning and supervised learning
	- Train unsupervised learning on all data (labelled and unlabelled)
	- Train supervised model on labelled data
	- Average scores from both the above models
	- Another way is to use auto encoder architecture, and from the latent space add another learning to binary classification
	- Reconstruction score can also be used as a feature in the supervised learning scenario

### Sequential modeling

- Things to consider: Sequence length and fixed input dimension
- 1D CNN for feature generation and then do binary classification
- LSTMs for feature generation, then use last hidden state for binary classificatib
- LSTMs + Attention layer on all hidden layers
	- Use current txn as context vector and all hidden states as input
	- Apply attention module on the above and get an output
	- Binary classifier on the output
