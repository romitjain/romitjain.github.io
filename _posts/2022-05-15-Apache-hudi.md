---
layout: post
title: Apache Hudi
category: [ml-ops, tech]
date: 2022-05-15
---

# Apache Hudi

### Basics

- Data Lake usually stores data in file based storage.
- Apache HUDI is a file format that offers a way to handle updates, deletes and ACID properties on the dataset.
- These functionality is not present in other file based storage like Parquet/ORC.
- Also helps with
	- Data versioning
	- Rollback

### Upserts

- For upserts, hudi will re write part file where the updated record is present instead of the complete partition (What's the difference b/w partition and part file?)

### Queries

There are 2 different types of query
1. Snapshot queries: Latest data
2. Incremental queries: Queries data after a given commit time

### Table types

There are 2 different types of table types
1. Copy on write: Stores in parquet and performs sync merge during write
2. Merge on Read: Columnar (eg: Parquet)+ Row (eg: Avro)
	1. Updates are written in delta files
	2. Mostly used for NRT or real time

### References
1. https://medium.com/@parth09/apache-hudi-the-basics-5c1848ca12e0
2. https://medium.com/apache-hudi-blogs/employing-the-right-indexes-for-fast-updates-deletes-in-apache-hudi-814d863635f6
