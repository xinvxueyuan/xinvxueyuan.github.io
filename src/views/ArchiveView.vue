<script setup lang="ts">
import { computed } from "vue";
import { useHead } from "@unhead/vue";

import PageIntro from "@/components/site/PageIntro.vue";
import PostCard from "@/components/content/PostCard.vue";
import { posts, taxonomy } from "@/lib/generated-content";
import { absoluteUrl } from "@/lib/site";

useHead({
  title: "文章归档",
  meta: [{ name: "description", content: "按年份浏览 xinvStar 的全部文章。" }],
  link: [{ rel: "canonical", href: absoluteUrl("/archive/") }],
});

const years = computed(() => {
  const groups = new Map<number, typeof posts>();
  for (const post of posts) {
    const year = new Date(post.published).getUTCFullYear();
    groups.set(year, [...(groups.get(year) ?? []), post]);
  }
  return [...groups.entries()].sort(([left], [right]) => right - left);
});
</script>

<template>
  <main
    id="main-content"
    class="page-shell"
    tabindex="-1"
  >
    <PageIntro
      title="文章归档"
      description="按时间回看写下的技术笔记与学习记录。"
    />
    <section
      v-for="[year, yearPosts] in years"
      :key="year"
      :aria-labelledby="`year-${year}`"
      class="archive-year"
    >
      <h2 :id="`year-${year}`">
        {{ year }}
      </h2>
      <div class="post-list">
        <PostCard
          v-for="post in yearPosts"
          :key="post.slug"
          :post="post"
          :taxonomy="taxonomy"
        />
      </div>
    </section>
  </main>
</template>
