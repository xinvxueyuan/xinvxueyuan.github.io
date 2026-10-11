<script setup lang="ts">
import { computed } from "vue";
import { useHead } from "@unhead/vue";
import { useRoute, RouterLink } from "vue-router";

import ArticleEnhancements from "@/components/interactive/ArticleEnhancements.vue";
import ArticleComments from "@/components/interactive/ArticleComments.vue";
import ShareActions from "@/components/interactive/ShareActions.vue";
import TableOfContents from "@/components/interactive/TableOfContents.vue";
import PostCard from "@/components/content/PostCard.vue";
import {
  getAdjacentPosts,
  getRelatedPosts,
} from "@/lib/content/recommendations";
import { getReadingStats } from "@/lib/content/reading";
import { getTaxonomyTermSlug } from "@/lib/content/taxonomy";
import type { Post, PostSummary } from "@/lib/content/types";
import { createBlogPosting, serializeStructuredData } from "@/lib/content/structured-data";
import { loadGeneratedPost, posts, taxonomy } from "@/lib/generated-content";
import { absoluteUrl, siteConfig } from "@/lib/site";

const route = useRoute();
const rawSlug = String(route.params.slug ?? "");
let slug = rawSlug;
if (/%[\da-f]{2}/iu.test(rawSlug)) {
  try { slug = decodeURIComponent(rawSlug); } catch { slug = ""; }
}
const post = await loadGeneratedPost(slug);
const canonicalUrl = post ? absoluteUrl(`/posts/${encodeURIComponent(post.slug)}/`) : absoluteUrl("/");
const ogImage = post ? absoluteUrl(`/posts/${encodeURIComponent(post.slug)}/opengraph-image`) : absoluteUrl(siteConfig.defaultOgImage);
const dateFormatter = new Intl.DateTimeFormat("zh-CN", { dateStyle: "long", timeZone: "UTC" });
const categoryPath = (name: string) => `/categories/${encodeURIComponent(getTaxonomyTermSlug(name, taxonomy.categories))}/`;
const tagPath = (name: string) => `/tags/${encodeURIComponent(getTaxonomyTermSlug(name, taxonomy.tags))}/`;
const publishedPosts = posts.map((item) => ({
  ...item,
  published: new Date(item.published),
  updated: item.updated ? new Date(item.updated) : undefined,
})) as unknown as PostSummary[];
const hydratedPost = post ? {
  ...post,
  published: new Date(post.published),
  updated: post.updated ? new Date(post.updated) : undefined,
} as unknown as Post : undefined;
const structuredData = computed(() => hydratedPost
  ? serializeStructuredData(createBlogPosting(hydratedPost))
  : "");
const reading = computed(() => post ? getReadingStats(post.body) : undefined);
const adjacent = post ? getAdjacentPosts(publishedPosts, post.slug) : undefined;
const related = post ? getRelatedPosts(publishedPosts, post.slug) : [];

useHead(() => {
  if (!post) return {
    title: "文章不存在",
    meta: [
      { name: "robots", content: "noindex" },
      { name: "description", content: "这篇文章不存在或已停止公开。" },
    ],
  };
  const description = post.description ?? siteConfig.description;
  return {
    title: post.title,
    meta: [
      { name: "description", content: description },
      { property: "og:type", content: "article" },
      { property: "og:title", content: post.title },
      { property: "og:description", content: description },
      { property: "og:url", content: canonicalUrl },
      { property: "og:image", content: ogImage },
      { property: "og:image:type", content: "image/png" },
      { property: "article:published_time", content: post.published },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: ogImage },
    ],
    link: [{ rel: "canonical", href: canonicalUrl }],
    script: [{ type: "application/ld+json", innerHTML: structuredData.value }],
  };
});
</script>

<template>
  <main
    id="main-content"
    class="page-shell page-shell--article"
    tabindex="-1"
  >
    <div
      v-if="!post"
      class="not-found"
    >
      <p class="not-found__code">
        404
      </p>
      <h1>这里没有这篇文章</h1>
      <p>链接可能已经失效，也可能从未存在。</p>
      <RouterLink
        class="button button--primary"
        to="/"
      >
        返回首页
      </RouterLink>
    </div>
    <div
      v-else
      class="article-layout"
    >
      <article class="post-page">
        <header class="post-page__header">
          <p class="article-kicker">
            XINVSTAR · 文章
          </p>
          <h1>{{ post.title }}</h1>
          <p
            v-if="post.description"
            class="post-page__description"
          >
            {{ post.description }}
          </p>
          <figure
            v-if="post.cover"
            class="article-cover"
          >
            <img
              :src="post.cover.src"
              :alt="post.cover.alt"
              :width="post.cover.width"
              :height="post.cover.height"
              fetchpriority="high"
            >
          </figure>
          <div class="article-meta">
            <time :datetime="post.published">{{ dateFormatter.format(new Date(post.published)) }}</time>
            <span>{{ reading?.minutes }} 分钟阅读</span>
            <span>{{ reading?.characters }} 个中日韩字符 · {{ reading?.words }} 个词</span>
            <RouterLink
              v-if="post.category"
              :to="categoryPath(post.category)"
            >
              {{ post.category }}
            </RouterLink>
            <RouterLink
              v-for="tag in post.tags"
              :key="tag"
              :to="tagPath(tag)"
            >
              #{{ tag }}
            </RouterLink>
          </div>
        </header>

        <ArticleEnhancements :target-id="'post-content'" />
        <div
          id="post-content"
          class="article-prose post-content"
          v-html="post.html"
        />

        <footer class="article-footer">
          <p class="article-license">
            除特别说明外，本文采用 CC BY-NC-SA 4.0 许可。
          </p>
          <ShareActions
            :title="post.title"
            :url="canonicalUrl"
          />
          <nav
            v-if="adjacent?.previous || adjacent?.next"
            class="article-adjacent"
            aria-label="相邻文章"
          >
            <RouterLink
              v-if="adjacent.previous"
              :to="`/posts/${encodeURIComponent(adjacent.previous.slug)}/`"
            >
              <span>上一篇</span><strong>{{ adjacent.previous.title }}</strong>
            </RouterLink>
            <RouterLink
              v-if="adjacent.next"
              :to="`/posts/${encodeURIComponent(adjacent.next.slug)}/`"
            >
              <span>下一篇</span><strong>{{ adjacent.next.title }}</strong>
            </RouterLink>
          </nav>
          <section
            v-if="related.length"
            class="related-posts"
            aria-labelledby="related-heading"
          >
            <h2 id="related-heading">
              继续阅读
            </h2>
            <div class="post-list">
              <PostCard
                v-for="item in related"
                :key="item.slug"
                :post="item"
                :taxonomy="taxonomy"
              />
            </div>
          </section>
          <ArticleComments :enabled="post.comment" />
        </footer>
      </article>
      <aside class="article-layout__aside">
        <TableOfContents :headings="post.headings" />
      </aside>
    </div>
  </main>
</template>
