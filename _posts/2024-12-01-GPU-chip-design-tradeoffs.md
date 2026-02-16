---
layout: post
title: GPU chip design tradeoffs
category: [gpus]
date: 2024-12-01
---


# GPU chip design tradeoffs

## CPUs

You have a design choice in CPU that you either run one thread on one core or one thread on every core. In the first scenario, the CPU over clocks the speed so that one thread runs really fast and finishes executions quickly.  In the second situation, the CPU lowers the clock speed so that it does not melt due to all cores working simultaneously.

GPUs solve for the second part.

## Hardware changes

From a hardware perspective, cache takes up a lot of space on the GPU. So the first design changes that happens is that you reduce the cache size and replace it with cores (that can process data).

Second change is that we reduce the size of cores so that we can add a lot of cores on the same dye size. This is done in several ways which are quite complicated but a gist is covered below.

1. Instead of having support for scalar and vector instructions, we only support vector instructions on GPU cores.
2. ISA = Instruction set architecture. With every new release of the architecture of the GPU, ISA is changed so that we don't have to support older GPUs. This is not the case with CPUs.
3. CUDA is compiled via clang of nvcc which emits PTX (parallel thread execution) which is a high level assembly code. PTX is compile via another closed source compiler which is in control with Nvidia

One major improvement that is done on GPUs is that each cores have hyper threads upto 64 in comparison to 2 on CPUs. So if a single thread is waiting to load data from the GPU memory (given cache is small), another thread on the same core can execute an arithmetic operation. This is based on the assumption that we have a lot of threads running in parallel on GPU.

