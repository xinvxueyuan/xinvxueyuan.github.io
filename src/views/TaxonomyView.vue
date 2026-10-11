<script setup lang="ts">
import { computed } from "vue";
import { useHead } from "@unhead/vue";
import { useRoute } from "vue-router";

import EmptyState from "@/components/site/EmptyState.vue";
import PageIntro from "@/components/site/PageIntro.vue";
import PostCard from "@/components/content/PostCard.vue";
import { findRouteTaxonomyTerm } from "@/lib/content/route-term";
import { posts, taxonomy } from "@/lib/generated-content";
import { absoluteUrl } from "@/lib/site";

const route = useRoute();
const kind = computed(() => route.name === "tag" ? "tag" : "category");
const rawTerm = computed(() => String(route.params[kind.value] ?? ""));
const term = computed(() => findRouteTaxonomyTerm(
  rawTerm.value,
  kind.value === "tag" ? taxonomy.tags : taxonomy.categories,
));
const matchingPosts = computed(() => {
  if (!term.value) return [];
  const normalized = term.value.name.trim().toLocaleLowerCase();
  return posts.filter((post) => kind.value === "tag"
    ? post.tags.some((tag) => tag.trim().toLocaleLowerCase() === normalized)
    : post.category?.trim().toLocaleLowerCase() === normalized);
});
const heading = computed(() => term.value
  ? `${kind.value === "tag" ? "标签" : "分类"}：${term.value.name}`
  : `${kind.value === "tag" ? "标签" : "分类"}不存在`);
const description = computed(() => term.value
  ? `浏览“${term.value.name}”下的 ${matchingPosts.value.length} 篇文章。`
  : "这个分类或标签尚未收录，或地址中的 slug 不正确。");

useHead(() => ({
  title: heading.value,
  meta: [
    { name: "description", content: description.value },
    ...(!term.value ? [{ name: "robots", content: "noindex" }] : []),
  ],
  ...(term.value ? {
    link: [{
      rel: "canonical",
      href: absoluteUrl(`/${kind.value === "tag" ? "tags" : "categories"}/${encodeURIComponent(term.value.slug)}/`),
    }],
  } : {}),
}));
</script>

<template>
  <main
    id="main-content"
    class="page-shell"
    tabindex="-1"
  >
    <PageIntro
      :title="heading"
      :description="description"
    />
    <div
      v-if="term"
      class="post-list"
    >
      <PostCard
        v-for="post in matchingPosts"
        :key="post.slug"
        :post="post"
        :taxonomy="taxonomy"
      />
    </div>
    <EmptyState
      v-else
      title="暂时没有这个主题"
      description="可以回到归档或搜索文章，继续浏览站内内容。"
      :link="{ href: '/archive/', label: '前往文章归档' }"
    />
  </main>
</template>
