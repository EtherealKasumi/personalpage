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
            <svg class="profile-orbital-portrait" viewBox="0 0 320 320" role="img" aria-labelledby="avatar-title-zh">
                <title id="avatar-title-zh">我的头像</title>
                <defs>
                    <clipPath id="avatar-clip-zh">
                        <circle cx="160" cy="160" r="82"></circle>
                    </clipPath>
                </defs>
                <g class="svg-orbits" aria-hidden="true">
                    <g transform="rotate(-18 160 178)">
                        <path id="orbit-path-a-zh" class="svg-orbit orbit-a" d="M28 178 C28 154 87 135 160 135 C233 135 292 154 292 178 C292 202 233 221 160 221 C87 221 28 202 28 178"></path>
                    </g>
                    <g transform="rotate(34 160 178)">
                        <path id="orbit-path-b-zh" class="svg-orbit orbit-b" d="M48 178 C48 159 98 144 160 144 C222 144 272 159 272 178 C272 197 222 212 160 212 C98 212 48 197 48 178"></path>
                    </g>
                </g>
                <g class="orbiting-objects orbiting-objects-back" aria-hidden="true">
                    <g transform="rotate(-18 160 178)">
                        <g class="orbital-body body-a">
                            <ellipse class="planet-ring" cx="0" cy="0" rx="10.4" ry="3.7" transform="rotate(-18)"></ellipse>
                            <circle class="planet-core" cx="0" cy="0" r="6.1"></circle>
                            <circle class="planet-glint" cx="-2.1" cy="-2.3" r="1.65"></circle>
                            <animateMotion dur="54s" begin="-14s" repeatCount="indefinite" rotate="0">
                                <mpath href="#orbit-path-a-zh"></mpath>
                            </animateMotion>
                            <animate attributeName="opacity" dur="54s" begin="-14s" repeatCount="indefinite" values="1;1;0;0;1" keyTimes="0;0.48;0.5;0.98;1"></animate>
                        </g>
                    </g>
                    <g transform="rotate(34 160 178)">
                        <g class="orbital-body body-b">
                            <circle class="planet-core" cx="0" cy="0" r="5.2"></circle>
                            <circle class="tiny-moon" cx="9" cy="-4.5" r="1.85"></circle>
                            <animateMotion dur="68s" begin="-34s" repeatCount="indefinite" rotate="0" keyPoints="1;0" keyTimes="0;1" calcMode="linear">
                                <mpath href="#orbit-path-b-zh"></mpath>
                            </animateMotion>
                            <animate attributeName="opacity" dur="68s" begin="-34s" repeatCount="indefinite" values="0;0;1;1;0" keyTimes="0;0.48;0.5;0.98;1"></animate>
                        </g>
                    </g>
                </g>
                <image class="avatar-svg-image" href="{{ '/assets/images/avatar.jpg' | relative_url }}" x="78" y="78" width="164" height="164" preserveAspectRatio="xMidYMid slice" clip-path="url(#avatar-clip-zh)"></image>
                <circle class="avatar-rim" cx="160" cy="160" r="88"></circle>
                <g class="svg-orbits-front" aria-hidden="true">
                    <g transform="rotate(-18 160 178)">
                        <path class="svg-orbit-front orbit-a" d="M292 178 C292 202 233 221 160 221 C87 221 28 202 28 178"></path>
                    </g>
                    <g transform="rotate(34 160 178)">
                        <path class="svg-orbit-front orbit-b" d="M272 178 C272 197 222 212 160 212 C98 212 48 197 48 178"></path>
                    </g>
                </g>
                <g class="orbiting-objects orbiting-objects-front" aria-hidden="true">
                    <g transform="rotate(-18 160 178)">
                        <g class="orbital-body body-a">
                            <ellipse class="planet-ring" cx="0" cy="0" rx="10.4" ry="3.7" transform="rotate(-18)"></ellipse>
                            <circle class="planet-core" cx="0" cy="0" r="6.1"></circle>
                            <circle class="planet-glint" cx="-2.1" cy="-2.3" r="1.65"></circle>
                            <animateMotion dur="54s" begin="-14s" repeatCount="indefinite" rotate="0">
                                <mpath href="#orbit-path-a-zh"></mpath>
                            </animateMotion>
                            <animate attributeName="opacity" dur="54s" begin="-14s" repeatCount="indefinite" values="0;0;1;1;0" keyTimes="0;0.48;0.5;0.98;1"></animate>
                        </g>
                    </g>
                    <g transform="rotate(34 160 178)">
                        <g class="orbital-body body-b">
                            <circle class="planet-core" cx="0" cy="0" r="5.2"></circle>
                            <circle class="tiny-moon" cx="9" cy="-4.5" r="1.85"></circle>
                            <animateMotion dur="68s" begin="-34s" repeatCount="indefinite" rotate="0" keyPoints="1;0" keyTimes="0;1" calcMode="linear">
                                <mpath href="#orbit-path-b-zh"></mpath>
                            </animateMotion>
                            <animate attributeName="opacity" dur="68s" begin="-34s" repeatCount="indefinite" values="1;1;0;0;1" keyTimes="0;0.48;0.5;0.98;1"></animate>
                        </g>
                    </g>
                </g>
            </svg>
        </div>

        <div class="profile-info">
            <p class="home-kicker">the 1000th summer ——</p>
            <h1><span>你好，我是</span><span>刘宇轩</span></h1>
            <p class="subtitle">南开大学数学科学学院 2023 级本科生。这里存放一些关于数学、物理、学习笔记和日常片段的文字。</p>

            <div class="action-buttons">
                <a href="{{ '/zh/cv.html' | relative_url }}" class="btn">简历</a>
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
