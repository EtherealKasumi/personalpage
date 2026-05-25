---
layout: default
title: Ledger
permalink: /ledger.html
---

<main class="blog-page ledger-page">
  <header class="blog-hero">
    <h1 class="blog-title">Ledger</h1>
    <p class="blog-quote">dated fragments, kept out of the main current</p>
  </header>

  <div class="blog-list">
    {% assign entries = site.ledger | sort: "date" | reverse %}
    {% for entry in entries %}
      <a href="{{ entry.url | relative_url }}" class="post-card-link">
        <article class="post-card ledger-card">
          <div class="post-meta">{{ entry.date | date: "%Y-%m-%d" }}</div>
          <h2 class="post-title">{{ entry.title }}</h2>
          <p class="post-excerpt">{{ entry.excerpt | strip_html | truncatewords: 36 }}</p>
        </article>
      </a>
    {% endfor %}
  </div>
</main>
