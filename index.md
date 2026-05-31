---
layout: default
title: Home
lang: en
ref: home
---

<main class="home-shell">
    <section class="profile-section" aria-label="Home hero">
        <div class="profile-media">
            <svg class="profile-orbital-portrait" viewBox="0 0 320 320" role="img" aria-labelledby="avatar-title-en">
                <title id="avatar-title-en">My Avatar</title>
                <defs>
                    <clipPath id="avatar-clip-en">
                        <circle cx="160" cy="160" r="82"></circle>
                    </clipPath>
                </defs>
                <g class="svg-orbits" aria-hidden="true">
                    <g transform="rotate(-18 160 178)">
                        <path id="orbit-path-a-en" class="svg-orbit orbit-a" d="M28 178 C28 154 87 135 160 135 C233 135 292 154 292 178 C292 202 233 221 160 221 C87 221 28 202 28 178"></path>
                    </g>
                    <g transform="rotate(34 160 178)">
                        <path id="orbit-path-b-en" class="svg-orbit orbit-b" d="M48 178 C48 159 98 144 160 144 C222 144 272 159 272 178 C272 197 222 212 160 212 C98 212 48 197 48 178"></path>
                    </g>
                </g>
                <g class="orbiting-objects orbiting-objects-back" aria-hidden="true">
                    <g transform="rotate(-18 160 178)">
                        <g class="orbital-body body-a">
                            <ellipse class="planet-ring" cx="0" cy="0" rx="10.4" ry="3.7" transform="rotate(-18)"></ellipse>
                            <circle class="planet-core" cx="0" cy="0" r="6.1"></circle>
                            <circle class="planet-glint" cx="-2.1" cy="-2.3" r="1.65"></circle>
                            <animateMotion dur="54s" begin="-14s" repeatCount="indefinite" rotate="0">
                                <mpath href="#orbit-path-a-en"></mpath>
                            </animateMotion>
                            <animate attributeName="opacity" dur="54s" begin="-14s" repeatCount="indefinite" values="1;1;0;0;1" keyTimes="0;0.48;0.5;0.98;1"></animate>
                        </g>
                    </g>
                    <g transform="rotate(34 160 178)">
                        <g class="orbital-body body-b">
                            <circle class="planet-core" cx="0" cy="0" r="5.2"></circle>
                            <circle class="tiny-moon" cx="9" cy="-4.5" r="1.85"></circle>
                            <animateMotion dur="68s" begin="-34s" repeatCount="indefinite" rotate="0" keyPoints="1;0" keyTimes="0;1" calcMode="linear">
                                <mpath href="#orbit-path-b-en"></mpath>
                            </animateMotion>
                            <animate attributeName="opacity" dur="68s" begin="-34s" repeatCount="indefinite" values="0;0;1;1;0" keyTimes="0;0.48;0.5;0.98;1"></animate>
                        </g>
                    </g>
                </g>
                <image class="avatar-svg-image" href="{{ '/assets/images/avatar.jpg' | relative_url }}" x="78" y="78" width="164" height="164" preserveAspectRatio="xMidYMid slice" clip-path="url(#avatar-clip-en)"></image>
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
                                <mpath href="#orbit-path-a-en"></mpath>
                            </animateMotion>
                            <animate attributeName="opacity" dur="54s" begin="-14s" repeatCount="indefinite" values="0;0;1;1;0" keyTimes="0;0.48;0.5;0.98;1"></animate>
                        </g>
                    </g>
                    <g transform="rotate(34 160 178)">
                        <g class="orbital-body body-b">
                            <circle class="planet-core" cx="0" cy="0" r="5.2"></circle>
                            <circle class="tiny-moon" cx="9" cy="-4.5" r="1.85"></circle>
                            <animateMotion dur="68s" begin="-34s" repeatCount="indefinite" rotate="0" keyPoints="1;0" keyTimes="0;1" calcMode="linear">
                                <mpath href="#orbit-path-b-en"></mpath>
                            </animateMotion>
                            <animate attributeName="opacity" dur="68s" begin="-34s" repeatCount="indefinite" values="1;1;0;0;1" keyTimes="0;0.48;0.5;0.98;1"></animate>
                        </g>
                    </g>
                </g>
            </svg>
        </div>

        <div class="profile-info">
            <p class="home-kicker">the 1000th summer ——</p>
            <h1><span>Hello, I am</span><span>Yuxuan Liu</span></h1>
            <p class="subtitle">An undergraduate student in mathematics at Nankai University, class of 2023, writing about mathematics, physics, and moments of clarity in learning.</p>
            
            <div class="action-buttons">
                <a href="{{ '/cv.html' | relative_url }}" class="btn">CV</a>
                <a href="{{ '/blogs.html' | relative_url }}" class="btn">Blogs</a>
                <a href="{{ '/notes.html' | relative_url }}" class="btn">Notes</a>
                <a href="{{ '/resources.html' | relative_url }}" class="btn">Resources</a>
            </div>
        </div>
    </section>

    <div class="home-sections">
        <section class="home-panel">
            <h2>About</h2>
            <p>I am a 2023 undergraduate student at the <a href="https://en.nankai.edu.cn/">Nankai University</a> <a href="http://en.math.nankai.edu.cn/">School of Mathematical Sciences</a>.</p>
            <ul class="contact-list">
                <li><strong>QQ</strong><span>2153412476</span></li>
                <li><strong>Email</strong><span>etherealkasumi@163.com</span></li>
            </ul>
        </section>

        <section class="home-panel">
            <h2>Current Work</h2>
            <p class="research-note">In progress...</p>
        </section>
    </div>
</main>
