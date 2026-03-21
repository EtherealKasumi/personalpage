---
layout: default
title: Blogs
permalink: /blogs.html
---

<h1 style="text-align: center; border-bottom: none; margin-bottom: 5px;">我的博客</h1>
<p style="text-align: center; color: #8b949e; margin-bottom: 40px; font-style: italic;">
  "Mathematics is the art of giving the same name to different things." — Henri Poincaré
</p>

<!-- 利用 Jekyll 的 for 循环自动抓取 _posts 里的文章 -->
<div class="blog-list" style="display: flex; flex-direction: column; gap: 20px;">
  {% for post in site.posts %}
    <a href="{{ post.url | relative_url }}" style="text-decoration: none; color: inherit;">
      <div style="padding: 25px; background: rgba(255,255,255,0.02); border: 1px solid rgba(88,166,255,0.1); border-radius: 8px; transition: all 0.3s ease;" 
           onmouseover="this.style.background='rgba(88,166,255,0.08)'; this.style.transform='translateX(5px)'; this.style.borderColor='rgba(88,166,255,0.4)';" 
           onmouseout="this.style.background='rgba(255,255,255,0.02)'; this.style.transform='translateX(0)'; this.style.borderColor='rgba(88,166,255,0.1)';">
        
        <div style="color: #58a6ff; font-family: monospace; font-size: 0.9em; margin-bottom: 8px;">
          📅 {{ post.date | date: "%Y-%m-%d" }}
        </div>
        
        <h2 style="margin: 0 0 10px 0; border-bottom: none; font-size: 1.4em; color: #c9d1d9;">
          {{ post.title }}
        </h2>
        
        <!-- 自动截取文章前 30 个词作为摘要 -->
        <p style="margin: 0; color: #8b949e; font-size: 0.95em;">
          {{ post.excerpt | strip_html | truncatewords: 30 }}
        </p>
      </div>
    </a>
  {% endfor %}
</div>