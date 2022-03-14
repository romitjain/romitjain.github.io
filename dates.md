---
layout: Post
title: By Date
permalink: /dates/
content-type: eg
---

<!-- markdownlint-disable MD009 MD033 -->

<style>
.date-content a {
    text-decoration: none;
    color: #4183c4;
}

.date-content a:hover {
    text-decoration: underline;
    color: #4183c4;
}
</style>

<main>
    {% assign postsByDay = site.notes | group_by_exp:"post", "post.date | date: '%B %Y'" | sort: "date" | reverse %}

    {% for day in postsByDay %}
      <h3 id="{{ day.name }}">{{ day.name }}</h3>
          {% for post in day.items %}
            <li id="date-content" style="padding-bottom: 0.6em; list-style: none;"><a href="{{ post.url }}">{{ post.title }}</a></li>
          {% endfor %}
    {% endfor %}
    
        <br/>
        <br/>
</main>
