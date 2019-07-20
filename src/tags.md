---
section: thoughts
layout: mainlayout.njk
pagination:
  data: collections
  size: 1
  alias: tag
permalink: /thoughts/tags/{{ tag }}/
filter:
  - post
---
<a href="/thoughts" class="back">← Back</a>

<h1>Tagged “{{ tag }}”</h1>

<ul>
{% set taglist = collections[ tag ] %}
{% for post in taglist | reverse %}
<article>
  <h2>
    <a href="{{ post.url | url }}">{{ post.data.title }}</a>
  </h2>
  <span class="posted-date">{{ post.date | dateReadable }}</span>
  {% for tag in post.data.tags %}
    {% if tag != "post" %}
  <a href="/thoughts/tags/{{ tag }}" class="tag">#{{ tag }}</a>
    {% endif %}
  {% endfor %}


  {{ post.data.description }} 

  <a href="{{ post.url | url }}">Read more →</a>


</article>
{% endfor %}
</ul>
