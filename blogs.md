---
layout: default
title: Blogs
lang: en
ref: blogs
permalink: /blogs.html
parent: home
---

<main class="blog-page">
  <header class="blog-hero">
    <h1 class="blog-title">Blog</h1>
    <p class="blog-quote">"Je suis d'ailleurs."</p>
  </header>

  <nav class="blog-quick-links" aria-label="Blog shortcuts">
    <a href="{{ '/ledger.html' | relative_url }}" class="ledger-entry">
      <span>Ledger</span>
      <small>daily notes, dated fragments</small>
    </a>

    <a href="{{ '/archive.html' | relative_url }}" class="archive-entry" aria-label="Open blog archive">
      Archive
    </a>
  </nav>

  <div class="blog-list">
    {% for post in site.posts %}
      <a href="{{ post.url | relative_url }}?from=blogs" class="post-card-link">
        <article class="post-card">
          <div class="post-meta">{{ post.date | date: "%Y-%m-%d" }}</div>
          <h2 class="post-title">{{ post.title }}</h2>
          <p class="post-excerpt">{{ post.excerpt | strip_html | truncatewords: 30 }}</p>
        </article>
      </a>
    {% endfor %}
  </div>
</main>
