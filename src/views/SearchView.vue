<script setup lang="ts">
import { computed } from "vue";
import { useHead } from "@unhead/vue";
import { useRoute } from "vue-router";

import PagefindSearch from "@/components/interactive/PagefindSearch.vue";
import { absoluteUrl } from "@/lib/site";

const route = useRoute();
const initialQuery = computed(() => {
  const query = route.query.q;
  return Array.isArray(query) ? query[0] ?? "" : query ?? "";
});

useHead({
  title: "搜索",
  meta: [
    { name: "description", content: "搜索 xinvStar 的文章正文、分类与标签。" },
    { name: "robots", content: "noindex,follow" },
  ],
  link: [{ rel: "canonical", href: absoluteUrl("/search/") }],
});
</script>

<template>
  <main
    id="main-content"
    class="page-shell page-shell--search"
    tabindex="-1"
  >
    <PagefindSearch :initial-query="initialQuery" />
  </main>
</template>
