<script setup lang="ts">
import { useHead } from "@unhead/vue";

import PostCard from "@/components/content/PostCard.vue";
import { posts, taxonomy } from "@/lib/generated-content";
import { absoluteUrl, siteConfig } from "@/lib/site";

useHead({
  title: "夜航问讯站",
  meta: [
    { name: "description", content: siteConfig.description },
    { property: "og:type", content: "website" },
    { property: "og:title", content: siteConfig.title },
    { property: "og:description", content: siteConfig.description },
    { property: "og:url", content: siteConfig.url },
    { property: "og:image", content: absoluteUrl(siteConfig.defaultOgImage) },
    { name: "twitter:card", content: "summary_large_image" },
  ],
  link: [{ rel: "canonical", href: siteConfig.url }],
});
</script>

<template>
  <main
    id="main-content"
    class="page-shell"
    tabindex="-1"
  >
    <section
      class="hero"
      aria-labelledby="hero-title"
    >
      <div class="hero__copy">
        <p class="hero__eyebrow">
          XINVSTAR · PERSONAL KNOWLEDGE MAP
        </p>
        <h1 id="hero-title">
          夜航问讯站
        </h1>
        <p>{{ siteConfig.description }}。</p>
        <div class="hero__actions">
          <a
            class="button button--primary"
            href="#latest-posts"
          >从最新文章开始</a>
          <RouterLink
            class="button button--quiet"
            to="/about/"
          >
            认识站长
          </RouterLink>
        </div>
        <p class="hero__note">
          技术、学习与生活，都在这里留下可追踪的航迹。
        </p>
      </div>
      <figure class="hero__visual">
        <img
          src="/assets/brand/xinvstar-night-orbit.webp"
          alt="琥珀星轨连接夜空中的知识节点"
          width="1536"
          height="1024"
          fetchpriority="high"
        >
        <figcaption>把每次好奇，记录成一段航程。</figcaption>
      </figure>
    </section>

    <section
      class="post-index"
      aria-labelledby="latest-posts"
    >
      <header class="section-heading">
        <p class="section-heading__eyebrow">
          FROM THE LOGBOOK
        </p>
        <h2 id="latest-posts">
          最新文章
        </h2>
        <p>新近写下的技术笔记与学习记录。</p>
      </header>
      <div class="post-list">
        <PostCard
          v-for="post in posts"
          :key="post.slug"
          :post="post"
          :taxonomy="taxonomy"
        />
      </div>
    </section>

    <section
      v-if="taxonomy.categories.length"
      class="topic-index"
      aria-labelledby="topic-heading"
    >
      <header class="section-heading">
        <p class="section-heading__eyebrow">
          EXPLORE BY TOPIC
        </p>
        <h2 id="topic-heading">
          沿着主题继续探索
        </h2>
      </header>
      <ul class="topic-list">
        <li
          v-for="category in taxonomy.categories.slice(0, 8)"
          :key="category.slug"
        >
          <RouterLink :to="`/categories/${encodeURIComponent(category.slug)}/`">
            {{ category.name }} <span>{{ category.count }}</span>
          </RouterLink>
        </li>
      </ul>
      <p>
        <RouterLink to="/search/">
          用关键词搜索全部文章
        </RouterLink>
      </p>
    </section>
  </main>
</template>
