---
layout: post
title: Kimball Modeling
category: [ml-ops, tech]
date: 2021-12-01
---

- Step Dimension
       - Abstract dimension defined in advance
       - Fact table will be joined with step dimension table, where the attributes of steps are mentioned
              - This kind of step dimension table is required more when there are variable number of steps related to the same grain of the fact table
              - One example is user sessions, where grain of the fact table is individual page events
       - It can also be done by embedding unique sequential codes in dimension table
       - For the invites flow, if we go ahead and embed this kind of step dimension table, the grain of the fact table would be when each invite is sent, cancelled, or accepted with an outrigger to the step dimension table. The step dimension table will define the number of steps left in the invite flow.

## DW Modelling Decision Framework

These are the set of questions that the DSE team faced during the initial modelling of our data warehouse. Some of these questions/rules are the best practices either defined by the book or agreed upon by the team.

All the references are added at the end of the documentation for easy access to them, and are a must read.

## What should be the data type of Natural Key and Surrogate Key

> Integer

- To treat a null value in the facts table, add a static value in dimension table (like 0)
- Surrogate key to be auto incremental integers

## Date Dimension table

- A date dimension table is created which would be referenced by `date_key` . This would be on date level granularity.
- We should also create a separate date-time dimension table which would be reference by date-time key. This would be on the minute level granularity.
- The natural key of the above dimension tables is of timestamp data type.
- The primary/surrogate key of the above dimension table is of integer data type.

## Order of columns in the table

- For the facts table, the order of the columns should be
  the first one is which is most populated
- For the dimension table it should depend on the consumption/importance of columns

## Should the natural key be contained in the facts table?

> NoReference : <https://www.kimballgroup.com/1998/05/surrogate-keys/>

- There should always be 1 source of truth
- 1 row of facts table should map to 1 row of dimension table, through Surrogate Key
- Ingestion happens with the natural key, Source doesn’t have the context of surrogate key
- While ETL, you replace NK with Surrogate Key in the facts table from dimension table

## Column Naming Convention

> Reference : Kimball GroupDesign Tip #168 What’s in a Name? - Kimball Group
>
### Formatting Rules

- Although the book suggests use of spaces in column name but space will create issues in processing and camel case can’t be supported in Redshift hence we decide to go ahead with the Snake Case (user*id, user*surrogate_key)
- No column name should be > 30-35 characters
- Abbreviations to be used sparsely, if used maintain an acronym table which should be approved by the business
- No trailing and leading white spaces

### Logical Rules

- Prefix the column names in the table with the context of the table
       - Prefixing column name in dimension table with the dimension table name
       - Prefixing column name in fact table with the name/abbreviated name of the table
- All surrogate keys should be suffixed by `_key`
- All natural keys should be suffixed by `_id`
- Whenever an action is being performed by a user, it is stored as suffixed by `_by_user_key` and if we are also storing the team of the user during the action in the fact table, we suffix it by `_by_team_key`. Also if an action in fact table is happening for a team as a whole, we name suffix column for team key as `_for_team_key`.
       - Ex: in `history_create` fact table, `_by_user_key` and `_by_team_key` is suffixed to appropriate columns, while in `team_invite_sent` fact table we suffix `_by_user_key` and `_for_team_key` to appropriate columns.

## Data Nomenclature

- All the values/attributes should be lowercase
- No trailing and leading white spaces

## Junk Dimensions

- Low cardinality flags and indicators should be treated as junk dimension
- Can be created on the fly or beforehand
- Can be packed into one or more junk dimensions
       - Example: If we have 5 dimensions with 3 possible values, total rows can be 243 (not much and can be managed)
       - Example: If we have 5 uncorrelated indicators with each 100 possible values, then it does not make sense to create a junk dimension table with a million rows
- Consider how many combinations can be there and if the data has any correlation

## Should we join junk dimension table to other dimension tables?

> No

- Junk dimension tables are almost always exclusive to facts table where some low cardinality attributes are grouped together.

## Degenerate Dimensions

- Facts table to have timestamp as degenerate dimension (does not necessarily define uniqueness)
- Facts table also need to have an id as degenerate dimension for ETL purposes

## Dimension References in other Dimension Tables

- For user dimension table, a single `team_key` would be stored which will be tracked by type 2 change.
- Any type 2 change in team dimension table will also be reflected by type 2 change in user dimension table.

## If there’s a one to one mapping from one dimension to other at a given time, should we flatten out the dimensions in the same table?

> YesReference : Kimball GroupDesign Tip #105 Snowflakes, Outriggers, and Bridges - Kimball Group

- Example: Team uses a foreign key for subscription dimension. Now the same subscription dimension table also has an attribute that is `team_id` indicating which teams this subscription id currently belongs to.
- Creating such tables introduces cycles in the model
- The solution is to flatten out such tables
       - This changes the SCD type of all many columns related to subscription dimension from type 1 to type 2, like `subscription_age_days` and provides contradictory SCD types for `subscription_createdat_timestamp`
       - The solution for this is covered here : [[Dimensional Modelling Decision Making Additional p]]  .
- Since, in our case subscription is a point of consumption for direct analysis, we move it into a separate dimension table.

## Additional points to keep in mind

- Plan dimension table is flattened out into subscription dimension table
       - Since the plan dimension table is consistent and all the attributes of the plan are Type 0
       - If we create a separate table for plans, we are snow flaking, which should be avoided
- Attributes v/s Metrics : If we need to define attributes in the dimension table then they should be type 2, and metrics (type 1) should be calculated through different snapshotted table to see day on day trend over it.
- In the dimension table there are some derived dimensions (child column) which are type 0 in context of the dimensions (parent column) that they are derived from. Though these parent dimensions may be type 2.
       - Example: `team_plan_id` is type 2 in context of team, but `team_plan_name` is type 0 in context of `team_plan` but does exist in team table.
       - In the schema definition, these kind of parent-child dimension should be properly indicated and marked
- There should logically never be a fact to fact table join. There should always be dimension base table from which the joins are derived.
- When one has to ask questions based on time/ date (trend/ MoM etc. kinds of analysis) , he/ she should always start with date dimension table as the base. While if the question differs and is rather based on some entity, he/ she should start with a different dimension table (of that entity) as the base table. Care should be taken not to start with the fact tables as the base table.
- When one has to answer questions related to any activity then the team-user association should be derived from facts table, rather when one has to answer attributes related queries based on team-user association (stateful information) then that information must be derived from dimension tables.
       - example: activity related query - subscription purchased by a particular user for teams
       - example: attribute related query - plan of the user (which is derived from the team of the user)
- In case of a unique event leading to creation of multiple rows in facts table (in batches), there should be a `transaction_id` to identify the rows that have been created as outcome of one event. Example: Request archive, History archive

## References

1. Natural Keys and Surrogate Keys in Facts table : [https://www.kimballgroup.com/1998/05/surrogate-keys/](https://www.kimballgroup.com/1998/05/surrogate-keys/)
2. How to handle missing values : [Kimball GroupDesign Tip #128 Selecting Default Values for Nulls - Kimball Group](https://www.kimballgroup.com/2010/10/design-tip-128-selecting-default-values-for-nulls/)
3. Timestamp in facts table : [Kimball GroupDesign Tip #51: Latest Thinking On Time Dimension Tables - Kimball Group](https://www.kimballgroup.com/2004/02/design-tip-51-latest-thinking-on-time-dimension-tables/)
4. Column Naming Convention : [Kimball GroupDesign Tip #168 What’s in a Name? - Kimball Group](https://www.kimballgroup.com/2014/07/design-tip-168-whats-name/)
5. Dimension to Dimension Joins : [Kimball GroupDimension-to-Dimension Table Joins](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/dimension-to-dimension-join/)
6. Calendar Date Dimension : [Kimball GroupCalendar Date Dimensions | Kimball Dimensional Modeling Techniques](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/calendar-date-dimension/)
7. Junk Dimension Tables : [Kimball GroupDesign Tip #113 Creating, Using, and Maintaining Junk Dimensions - Kimball Group](https://www.kimballgroup.com/2009/06/design-tip-113-creating-using-and-maintaining-junk-dimensions/)
8. Differences between Snowflakes, Outrigger, and Bridges : [Kimball GroupDesign Tip #105 Snowflakes, Outriggers, and Bridges - Kimball Group](https://www.kimballgroup.com/2008/09/design-tip-105-snowflakes-outriggers-and-bridges/)
9. Role Playing Dimension : [Kimball GroupRole-Playing Dimensions | Kimball Dimensional Modeling Techniques](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/role-playing-dimension/)
10. [Kimball GroupDesign Tip #140 Is it a Dimension, a Fact, or Both? - Kimball Group](https://www.kimballgroup.com/2011/11/design-tip-140-is-it-a-dimension-a-fact-or-both/)
11. [https://www.kimballgroup.com/2007/12/design-tip-97-modeling-data-as-both-a-fact-and-dimension-attribute/](https://www.kimballgroup.com/2007/12/design-tip-97-modeling-data-as-both-a-fact-and-dimension-attribute/)

## Notes on SCD

- **Dealing with Slowly Changing Dimension Attributes (SCD)**
- References:
       - [http://datawarehouse4u.info/SCD-Slowly-Changing-Dimensions.html](http://datawarehouse4u.info/SCD-Slowly-Changing-Dimensions.html)
       - [https://www.kimballgroup.com/2013/02/design-tip-152-slowly-changing-dimension-types-0-4-5-6-7/](https://www.kimballgroup.com/2013/02/design-tip-152-slowly-changing-dimension-types-0-4-5-6-7/)
- We can have the attributes in the same dimension table that are handled with different change tracking techniques.
- Type 0: Retain Original
       - These values never change, facts are always grouped by this original value
       - Most date attributes (user created date, dob, user pro purchase date, etc..)
- Type 1: Overwrite
       - Always overwrite the changed attribute
       - Always reflects the most recent assignment
       - Pro - Space, fact table is untouched
       - Cons - Overrites History
       - ![[../assets/images/scd1.png]]
- Type 2: Add new row
       - ![[../assets/images/scd2.png]]
- Type 3: Add new attribute
       - Adds a new attribute to preserve the old attribute
       - The new value overwrites the main attribute as in a type 1 change
       - No need to track unpredictable changes. No use of comparing city change of some customers from 10 days ago and some customers from 10 years ago
       - Used when there’s a significant change impacting many rows in the dimension table or compare pre era and post era
       - Collection ownership/Workspace ownership
       - Pro - BI user can filter through current attribute or through / alternate reality (as a new column is added for the previous value)
       - Con - History is limited to the number of columns created, not scalable
       - ![[../assets/images/scd3.png]]
- Type 4: Add Mini-Dimension
       - When a group of attributes in a dimension rapidly changes (mini dimension)
       - All the historical attribute changes are stored in a different table which are called through its own unique primary key
       - OR, the mini dimension table contains all the combination of changes and when a facts occur, just capture the key of mini dimension table too.
       - The dimension table has the most recent value
       - In the facts table, the PK of both the base dimension and mini dimension are captured
       - Number of requests in a collection
       - Pro -
              - Base dimension table is not cluttered (in terms of changing attributes and number of rows)
              - If the dimension table is already multi million rows table, rapidly changing values can add rows and slow query times
       - Cons - Difficult to manage joins and PK for mini dimensions
       - ![[../assets/images/scd41.png]]
       - ![[../assets/images/scd42.png]]
- Type 5: Add Mini Dimension and Type 1 Outrigger
       - Accurately preserve the historical attribute values
       - Report historical facts according to current attribute values
       - Currently assigned mini dimension attributes to be accessed along with the others in the base dimension
       - Type 1 mini dimension assignment is updated (ETL)
       - Pro
              - Base dimension table is not cluttered (in terms of changing attributes and number of rows)
              - Mini dimension current attributes are available in the base dimension table
       - Cons - Creates a heavy load on ETL to update the current values of mini dimension
       - ![[../assets/images/scd5.png]]
- Type 6: Add Type 1 Attributes to Type 2 Dimension
       - Delivers both historical and current dimension attribute values
       - Type 1 + Type 2 + Type 3
       - Current Value is overridden with Type 1 logic
       - A new row is created for attribute change with Type 2 logic
       - A Historical column is added with Type 3 logic
- Pro
       - Best of type 1, type 2 and type 3
       - BI user can flexibly filter on previous values and compare it with current values without self join
- Con
       - Space consuming, hard to manage columns
       - Type 1 systematic over writing has to be done for all the rows for a particular dimension (ETL Load)
       - ![[../assets/images/scd61.png]]
  -![[../assets/images/scd62.png]]
- Type 7: Dual Type 1 and Type 2 Dimension
- The fact table contains dual foreign keys for a given dimension
- Similar as Type 6, but is accomplished via dual keys
- ![[../assets/images/scd7.png]]
- ^ Product dimension tracks the changes, and Current Product Dimension always display the current information
- Pro
       - Segregation of type 1 and type 2
       - Easier access to stateful as well as historical data
- Cons
       - Need to maintain 2 separate table for each dimension
       - ![[../assets/images/scd72.png]]
