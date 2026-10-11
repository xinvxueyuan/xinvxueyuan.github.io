<script setup lang="ts">
import { onMounted, ref } from "vue";

import { createRetryableLoader } from "@/lib/retryable-loader";

type PagefindResult = {
  data(): Promise<{
    excerpt: string;
    meta: { title?: string };
    url: string;
  }>;
};
type Pagefind = {
  search(query: string): Promise<{ results: PagefindResult[] }>;
};

const props = defineProps<{ initialQuery?: string }>();
const query = ref(props.initialQuery ?? "");
const results = ref<{ excerpt: string; title: string; url: string }[]>([]);
const status = ref("输入关键词开始搜索");
let request = 0;

const loadPagefind = createRetryableLoader<Pagefind>(
  async () => {
    const generatedBundle = "/pagefind/pagefind.js";
    return await import(/* @vite-ignore */ generatedBundle) as Pagefind;
  },
);

const search = async (value: string): Promise<void> => {
  query.value = value;
  const current = ++request;
  const normalized = value.trim();
  if (!normalized) {
    results.value = [];
    status.value = "输入关键词开始搜索";
    return;
  }

  status.value = "正在搜索…";
  try {
    const response = await (await loadPagefind()).search(normalized);
    const entries = await Promise.all(response.results.map((result) => result.data()));
    if (current !== request) return;
    results.value = entries.map((entry) => ({
      excerpt: entry.excerpt,
      title: entry.meta.title ?? entry.url,
      url: entry.url,
    }));
    status.value = entries.length ? `找到 ${entries.length} 篇文章` : "没有找到相关文章";
  } catch {
    if (current !== request) return;
    results.value = [];
    status.value = "搜索暂时不可用，请使用归档页";
  }
};

onMounted(() => {
  if (query.value) void search(query.value);
});
</script>

<template>
  <section
    role="search"
    aria-labelledby="search-title"
  >
    <h1 id="search-title">
      搜索文章
    </h1>
    <label for="pagefind-query">关键词</label>
    <input
      id="pagefind-query"
      v-model="query"
      type="search"
      autocomplete="off"
      placeholder="标题、分类、标签或正文"
      @focus="void loadPagefind().catch(() => undefined)"
      @input="void search(query)"
    >
    <p aria-live="polite">
      {{ status }}
    </p>
    <p v-if="status === '搜索暂时不可用，请使用归档页'">
      <a href="/archive/">前往文章归档</a>
    </p>
    <ul>
      <li
        v-for="result in results"
        :key="result.url"
      >
        <a :href="result.url">{{ result.title }}</a>
        <p>{{ result.excerpt.replace(/<[^>]*>/gu, "") }}</p>
      </li>
    </ul>
  </section>
</template>
