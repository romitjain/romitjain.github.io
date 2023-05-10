---
title: AdaBoost
tags: machine-learning reference-notes
date: 2022-06-04
---

1. TOC
{:toc}

## Difference between Bagging and Boosting

1. In random forest (bagging model), each tree is independent. In boosting each tree is dependent on the earlier one
2. In random forest, each tree is made upto the leaf node. In boosting, each tree is usually a stump tree.
3. In random forest, each tree gets an equal say in the prediction. In boosting, each tree gets weighted say in the prediction. This is based on how well an individual tree is able to predict the output

## Step by Step

1. Sample weight of each of the sample (data point) is $s_i = \frac{1}{N}\space \forall 0<i<=N$ where `N` is the number of samples.
    1. This is the importance of a single sample.
    2. All of the sample weights add up to 1
2. Train a stump (single split decision tree) which has the lowest (Weighted) Gini index. Note: Only one feature will be used to make this stump. Call this tree `t_0`
3. Find out the amount of say `t_0` has on the overall classification.
    1. $A = 1/2 * \log\frac{(1 - error)}{error}$ (`A` = amount of say)
    2. $error = \sum_{i=1}^k s_i$, where `|k|` are the number of errors on the samples this tree made.
4. We now penalize the incorrectly classified samples by increasing it's sample weight and decrease the sample weight of the correctly classified samples.
    1. For incorrectly classified samples, the new sample weight is: $s_i' = s_i * e^A$
    2. For correctly classified samples, the new sample weight is: $s_i' = s_i * e^{(-A)}$
    3. Normalize the new sample weights so that $$\sum_{i}^N s_i = 1$$
5. Repeat steps 2 to 4 by using weighted Gini index or by creating a new data set where you sample the samples by their sample weights. Higher the sample weight, more is the probability of that sample occurring in the new dataset.

## References

1. [StatQuest](https://www.youtube.com/watch?v=LsK-xG1cLYA&list=PLblh5JKOoLUICTaGLRoHQDuF_7q2GfuJF&index=48&ab_channel=StatQuestwithJoshStarmer)
