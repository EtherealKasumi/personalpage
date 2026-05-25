---
layout: default
title: Blogs
permalink: /blogs.html
---

<main class="blog-page">
  <header class="blog-hero">
    <h1 class="blog-title">我的博客</h1>
    <p class="blog-quote">"行到水穷处, 坐看云起时."</p>
  </header>

  <div class="blog-list">
    {% for post in site.posts %}
      <a href="{{ post.url | relative_url }}" class="post-card-link">
        <article class="post-card">
          <div class="post-meta">{{ post.date | date: "%Y-%m-%d" }}</div>
          <h2 class="post-title">{{ post.title }}</h2>
          <p class="post-excerpt">{{ post.excerpt | strip_html | truncatewords: 30 }}</p>
        </article>
      </a>
    {% endfor %}
  </div>
</main>
