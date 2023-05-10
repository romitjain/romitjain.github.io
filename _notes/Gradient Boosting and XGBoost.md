---
title: Gradient Boosting and XGBoost
tags: machine-learning reference-notes
date: 2022-06-05
---


1. TOC
{:toc}

## What is boosting?

Boosting is tweaking your model sequentially. Fit a model and see where it lacks and improve that specific part.

## What is Gradient Boosting?

- Gradient Boosting: Special case of boosting where errors are minimized by gradient decent algorithm
- Different than [[AdaBoost]]
    - AdaBoost uses weighted versions of training examples, while GBMs use gradients for model coefficients
    - GBMs make slightly larger individual trees than stumps in AdaBoost
    - GBMs scales the trees by same amount, but in AdaBoost trees are scaled according to the relative amount of say

### Step by Step (Regression, StatQuest example)

[[See references for the StatQuest video::rmn]]

1. Start by predicting the average of continuous values. $$\hat{y'}$$ (average value of continuous values)
2. Formula: $$Residual = (Observed\space value - Predicted\space value\space in\space the\space previous\space step)$$
    1. $$r = y - \hat{y'}$$
3. Fit a tree to the residuals, and average values in the leaf nodes. $$\hat{y''}$$ (Value after fitting the model and averaging the leaf nodes)
4. Final combined prediction would be: $$\hat{y} = \hat{y'} + (\lambda*\hat{y''})$$, where $$\lambda$$ is the learning rate.
5. Repeat step 2-4 while taking $$\hat{y}$$ as now the predicted value $$\hat{y'}$$
6. After each step we add the predictions we get from fitting the residuals to the overall prediction

### Step by Step (Regression, Kaggle example)

[[See references for the Kaggle blog::rmn]]

1. Fit a model to the data. $$f_1(x) => y$$
2. Fit a model to the residuals $$h_1(x) ⇒ y - f_1(x)$$
3. Create a new model, $$f_2(x) ⇒ f_1(x) + h_1(x)$$
4. $$⇒$$ signifies train model on
5. After training $$f_1(x)$$ we will have $$\hat y_1$$
6. After training $$f_2(x)$$ we will have $$\hat y_2$$

#### Working example

1. Essentially:
    1. $$\hat y_1 = f_1(x)$$ (on `y`)
    2. $$r_1 = y - \hat y_1$$
    3. $$\hat y_{11} = h_1(x)\space on\space (r_1)$$
    4. $$\hat y_2 = f_2(x) \space (\space on\space \hat y_1 + \hat y_{11})$$
2. ![image](/assets/images/gbm_1.png)
3. Second equation is just a model, doesn’t need to be a decision tree
4. General Equation:
    1. `F_m+1(x) = F_m(x) + h_m(x) for m>0`
    2. `h_m(x) = y - F_m(x)`
    3. `F_0(x)` is mean of the training target values
    4. `h_m(x)` is a model
    5. Tweak above model (`h_m(x)` ) to optimize gradient descent
5. ![image](/assets/images/gbm_2.png)
6. It can work with any model as long as you have a differentiable loss function for the algorithm to minimize

## What is XGBoost

- XGBoost = eXtreme Gradient Boosting
- XGBoost: Largely software and hardware optimization of Gradient Boosting
- $\lambda$ is used for regularization
- $\gamma$ is used for pruning
- $\eta$ is the scaling parameter for each tree
- For classification: Cover is defined as similarity score - $$\lambda$$.  Cover controls how much can we grow the tree

### Step by Step (Regression, StatQuest)

1. We fit an XGBoost tree instead of a regular regression tree
2. Make an initial prediction of `0.5`
3. Fit a tree and calculate similarity scores of all the nodes
4. Calculate the gain of a parent node based on its and its children similarity score 
5. Once the tree is fit to the desired depth, we prune the tree based on $\gamma$ value
6. $\eta$ is the learning rate for scaling individual trees

### How XGBoost performs better than GBMs

1. System Optimization
2. Parallelization
3. Tree Pruning
    1. Uses `max_depth` rather than `negative loss` criterion
4. Hardware Optimization
5. Algorithmic Enhancements
6. Regularization
7. Sparsity Awareness
    1. Finds best missing values
8. Weighted Quantile Sketch
    1. Efficiently find an optimal split
9. Cross Validation
    1. In build CV

### References

1. [XGBoost Algorithm: Long May She Reign! - Towards Data Science](https://towardsdatascience.com/https-medium-com-vishalmorde-xgboost-algorithm-long-she-may-rein-edd9f99be63d)
2. [Introduction to Boosted Trees — xgboost 1.0.0-SNAPSHOT documentation](https://xgboost.readthedocs.io/en/latest/tutorials/model.html)
3. [Reference video](https://www.youtube.com/watch?v=3CC4N4z3GJc&list=PLblh5JKOoLUICTaGLRoHQDuF_7q2GfuJF&index=49&ab_channel=StatQuestwithJoshStarmer)
4. [Kaggle Blog](http://blog.kaggle.com/2017/01/23/a-kaggle-master-explains-gradient-boosting/)
