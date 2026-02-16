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