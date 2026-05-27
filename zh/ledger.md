---
layout: default
title: 流水账
lang: zh
ref: ledger
permalink: /zh/ledger.html
---

<main class="blog-page ledger-page">
  <header class="blog-hero">
    <h1 class="blog-title">Ledger</h1>
    <p class="blog-quote">"Je suis d'ailleurs."</p>
  </header>

  <div class="ledger-index">
    {% assign entries = site.ledger | sort: "date" | reverse %}
    {% if entries.size > 0 %}
      {% assign current_year = "" %}
      {% assign current_month = "" %}

      {% for entry in entries %}
        {% assign entry_year = entry.date | date: "%Y" %}
        {% assign entry_month = entry.date | date: "%m" %}

        {% if entry_year != current_year %}
          {% unless forloop.first %}
              </div>
            </section>
          </div>
        </section>
          {% endunless %}

          <section class="ledger-year" aria-labelledby="ledger-year-{{ entry_year }}">
            <h2 class="ledger-year-title" id="ledger-year-{{ entry_year }}">{{ entry_year }}</h2>
            <div class="ledger-months">
          {% assign current_year = entry_year %}
          {% assign current_month = "" %}
        {% endif %}

        {% if entry_month != current_month %}
          {% unless current_month == "" %}
              </div>
            </section>
          {% endunless %}

            <section class="ledger-month" aria-labelledby="ledger-month-{{ entry_year }}-{{ entry_month }}">
              <h3 class="ledger-month-title" id="ledger-month-{{ entry_year }}-{{ entry_month }}">
                {{ entry_month }}<span>月</span>
              </h3>
              <div class="ledger-date-grid">
          {% assign current_month = entry_month %}
        {% endif %}

                <a href="{{ entry.url | relative_url }}" class="ledger-date" aria-label="{{ entry.date | date: "%Y-%m-%d" }}">
                  <time datetime="{{ entry.date | date_to_xmlschema }}">{{ entry.date | date: "%d" }}</time>
                </a>

        {% if forloop.last %}
              </div>
            </section>
          </div>
        </section>
        {% endif %}
      {% endfor %}
    {% else %}
      <p class="ledger-empty">还没有流水账。</p>
    {% endif %}
  </div>
</main>
