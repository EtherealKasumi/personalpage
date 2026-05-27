---
layout: default
title: 博客
lang: zh
ref: blogs
permalink: /zh/blogs.html
---

<main class="blog-page">
  <header class="blog-hero">
    <h1 class="blog-title">博客</h1>
    <p class="blog-quote">"Je suis d'ailleurs."</p>
  </header>

  <a href="{{ '/zh/ledger.html' | relative_url }}" class="ledger-entry">
    <span>流水账</span>
    <small>日常记录，按日期收纳的片段</small>
  </a>

  <div class="blog-list">
    {% for post in site.posts %}
      <a href="{{ post.url | relative_url }}?ui=zh" class="post-card-link">
        <article class="post-card">
          <div class="post-meta">{{ post.date | date: "%Y-%m-%d" }}</div>
          <h2 class="post-title">{{ post.title }}</h2>
          <p class="post-excerpt">{{ post.excerpt | strip_html | truncatewords: 30 }}</p>
        </article>
      </a>
    {% endfor %}
  </div>
</main>
