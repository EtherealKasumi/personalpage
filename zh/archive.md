---
layout: default
title: 归档
lang: zh
ref: archive
permalink: /zh/archive.html
parent: blogs
---

<main class="blog-page ledger-page archive-page">
  <header class="blog-hero">
    <h1 class="blog-title">归档</h1>
    <p class="blog-quote">"Je suis d'ailleurs."</p>
  </header>

  <div class="ledger-index archive-index">
    {% assign posts = site.posts | sort: "date" | reverse %}
    {% if posts.size > 0 %}
      {% assign current_year = "" %}
      {% assign current_month = "" %}

      {% for post in posts %}
        {% assign post_year = post.date | date: "%Y" %}
        {% assign post_month = post.date | date: "%m" %}

        {% if post_year != current_year %}
          {% unless forloop.first %}
              </div>
            </section>
          </div>
        </section>
          {% endunless %}

          <section class="ledger-year archive-year" aria-labelledby="archive-year-{{ post_year }}">
            <h2 class="ledger-year-title" id="archive-year-{{ post_year }}">{{ post_year }}</h2>
            <div class="ledger-months">
          {% assign current_year = post_year %}
          {% assign current_month = "" %}
        {% endif %}

        {% if post_month != current_month %}
          {% unless current_month == "" %}
              </div>
            </section>
          {% endunless %}

            <section class="ledger-month archive-month" aria-labelledby="archive-month-{{ post_year }}-{{ post_month }}">
              <h3 class="ledger-month-title" id="archive-month-{{ post_year }}-{{ post_month }}">
                {{ post_month }}<span>月</span>
              </h3>
              <div class="archive-post-list">
          {% assign current_month = post_month %}
        {% endif %}

                <a href="{{ post.url | relative_url }}?ui=zh&from=archive" class="archive-post">
                  <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%Y-%m-%d" }}</time>
                  <span>{{ post.title }}</span>
                </a>

        {% if forloop.last %}
              </div>
            </section>
          </div>
        </section>
        {% endif %}
      {% endfor %}
    {% else %}
      <p class="ledger-empty">还没有文章。</p>
    {% endif %}
  </div>
</main>
