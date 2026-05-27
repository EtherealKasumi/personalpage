---
layout: default
title: 主页
lang: zh
ref: home
permalink: /zh/
---

<main class="home-shell">
    <section class="profile-section" aria-label="主页">
        <div class="profile-media">
            <img src="{{ '/assets/images/avatar.jpg' | relative_url }}" alt="我的头像" class="profile-avatar">
        </div>

        <div class="profile-info">
            <p class="home-kicker">the 1000th summer ——</p>
            <h1><span>你好，我是</span><span>刘宇轩</span></h1>
            <p class="subtitle">南开大学数学科学学院 2023 级本科生。这里存放一些关于数学、物理、学习笔记和日常片段的文字。</p>

            <div class="action-buttons">
                <a href="{{ '/zh/cv.html' | relative_url }}" class="btn">CV</a>
                <a href="{{ '/zh/blogs.html' | relative_url }}" class="btn">博客</a>
                <a href="{{ '/zh/notes.html' | relative_url }}" class="btn">笔记</a>
                <a href="{{ '/zh/resources.html' | relative_url }}" class="btn">资源</a>
            </div>
        </div>
    </section>

    <div class="home-sections">
        <section class="home-panel">
            <h2>关于</h2>
            <p>我是<a href="https://en.nankai.edu.cn/">南开大学</a><a href="http://en.math.nankai.edu.cn/">数学科学学院</a> 2023 级本科生。</p>
            <ul class="contact-list">
                <li><strong>QQ</strong><span>2153412476</span></li>
                <li><strong>Email</strong><span>etherealkasumi@163.com</span></li>
            </ul>
        </section>

        <section class="home-panel">
            <h2>近况</h2>
            <p class="research-note">正在更新中...</p>
        </section>
    </div>
</main>
