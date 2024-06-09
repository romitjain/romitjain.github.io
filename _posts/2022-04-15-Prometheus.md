---
layout: post
title: Prometheus and PromQL mental model
category: [ml-ops, tech]
date: 2022-04-15
---


1. TOC
{:toc}

> Caution: This should not be treated as a starting document for learning Prometheus and PromQL. Rather this can be treated as a supplement while you are reading a few indepth blogs

## Prometheus

- Tool for collecting metrics and data from applications hosted on the cloud
- Popular in containerized environments

### Components

**Targets** are your applications hosted on the cloud

1. Retrieval
    1. Retrieval component is responsible for **pulling** metrics from targets.
    2. 3 types of metrics are supported in Prometheus (more [below](#metric-types))
    3. For retrieval mechanism to work, target must expose some metrics. You can add these metric definitions in your code and expose them on `/metrics` endpoint. All of this is supported in Prometheus client libraries available for a lot of languages
    4. There are some exporters that automatically export some metrics from your cloud instance and expose them. Eg: [Node exporter](https://github.com/prometheus/node_exporter)
2. Storage
    1. After retrieving, prometheus stores the data in time series format in a database
3. Query server
    1. You can query the metics stored in the database using a query language known as PromQL
    2. A tool that is very famous for querying and visualizing prometheus metrics is [Grafana](https://grafana.com/)
4. Alert manager
    1. This component is responsible for setting up alerts based on certain conditions
    2. You can write a query, which when gives certain results, can alert you

![image](/assets/images/Prometheus.svg)

## Prom QL

To understand querying in PromQL, you need to understand the supported data types, labels and metric types

### Data types

1. Scalars
    1. Single numerical values
    2. Value of a metric at a particular timestemp
2. Instant vectors
    1. Array of scalars
    2. You get instant vectors by aggregating scalars over single point in time
    3. You can query instant vectors directly by name
3. Range vectors
    1. Array of instant vectors (effectively array of array)
    2. You get instant vectors by aggregating instant vectors over different periods of times
    3. You can query range vectors with a time selector such as `metric_name_total[5m]`

### Labels

You can add a label to a metric. For example, instead of creating different metrics for request with `2xx` and `4xx` codes, you can create a single metric and add label for `2xx` and `4xx`

### Metric types

1. Counter
    1. How many times `x` happened
    2. Stores scalar values
2. Gauge
    1. What is the current value of `x`
    2. Stores scalar values
3. Histogram
    1. How long or how big?
    2. Useful for plotting time distribution of request times
    3. Collection of counters

Querying in PromQL is made easy by different functions and operators that you can apply over the metric types

### Function and operators

1. Aggregation operators
    1. Converts instant vector to instant vector
    2. Eg: `sum`, `min`, `avg`
2. Binary operators (`*, /, +, -`)
    1. Converts same type of metric type and operates on same type of metrics
3. Delta, increase, rate
    1. Converts range vectors to instant vectors
    2. Delta is applied over gauge metric type
    3. Increase and rate are applied over counter metric type
    4. Always `sum` a `rate` and never the other way round
4. Histogram quantiles
    1. Applied over histogram metric types

## Reference

1. [Prometheus quick lesson video](https://www.youtube.com/watch?v=h4Sl21AKiDg)
2. [PromQL for Mere Mortals](https://www.youtube.com/watch?v=hTjHuoWxsks)
    1. Best resource for understanding PromQL in my opinion
3. [Intro to PromQL](https://grafana.com/blog/2020/02/04/introduction-to-promql-the-prometheus-query-language/)
4. [Another intro to PromQL](https://timber.io/blog/promql-for-humans/)
