---
layout: post
title: Database Sharding
category: [ml-ops, tech]
date: 2023-06-20
---

## Sharding

Sharding is a concept in DBs where a large DB is broken up into multiple smaller DBs. This is also called as scaling out your data base or horizontal scaling.

Each smaller DB manages some chunk of data and each smaller DB might also have a read replica.

Example:

* You have 100 rows, 4 shards
* 1 master and 2 slave nodes will be responsible for 25 rows considering we added 2 read replicas
* We will have a total of 4 master nodes and 8 slave nodes all working in a distributed fashion

### Difference from partitioning

Database servers are sharded while the data is partitioned (specific keys moving to a specific shard).

It is entirely possible for us to partition the data into 5 "chunks" and have 2 shards of the server. In that scenario, 2 partitions of data might live on one shard and other 3 partition on other shard.

Data can be partitioned either row level (horizontal partitioning) or column level (vertical partitioning).

One of the major disadvantages of having a sharded and partitioned database is cross shard queries. To avoid that, we would typically want single query to be answerable by a single shard.

### Examples

1. Non sharded not partitioned database - Local MySQL server
2. Non sharded partitioned database - MySQL server with multiple databases
3. Sharded not partitioned database - MySQL server with read replicas
4. Sharded partitioned database - MySQL server where different partitions live in different shards, possibly with read replicas of each shard

### Different types of sharding

#### Vertical sharding

In vertical sharding, you typically move different tables in different shards. The application has to take care of which shard to hit for which table. This gets complex when we want to move a table from one shard to another.
This also gets complex from application PoV, because now the application also needs to know the sharding logic of the DB. Out of this need, [Vitess](https://vitess.io/docs/15.0/overview/history/) was born which allows us to decouple application from DB sharding.

### To read

Why is it said that sharding is easy in NoSQL DBs? What makes them easy to shard?

### Reference

1. [Arpit bhayani](https://www.youtube.com/watch?v=wXvljefXyEo)
2. [YouTube system design example](https://www.youtube.com/watch?v=jPKTo1iGQiE)
