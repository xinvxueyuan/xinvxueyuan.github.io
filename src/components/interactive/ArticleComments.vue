<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";

const props = defineProps<{ enabled: boolean }>();
const env = import.meta.env;
const config = {
  repo: env.VITE_GISCUS_REPO,
  repoId: env.VITE_GISCUS_REPO_ID,
  category: env.VITE_GISCUS_CATEGORY,
  categoryId: env.VITE_GISCUS_CATEGORY_ID,
};
const nearViewport = ref(false);
const theme = ref("light");
const root = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | undefined;
let mutation: MutationObserver | undefined;
let script: HTMLScriptElement | undefined;

const configured = (): boolean => Boolean(
  props.enabled && config.repo && config.repoId && config.category && config.categoryId,
);

const load = (): void => {
  if (!nearViewport.value || script || !configured() || !root.value) return;
  script = document.createElement("script");
  script.src = "https://giscus.app/client.js";
  script.async = true;
  script.crossOrigin = "anonymous";
  Object.entries({
    "data-repo": config.repo,
    "data-repo-id": config.repoId,
    "data-category": config.category,
    "data-category-id": config.categoryId,
    "data-mapping": "pathname",
    "data-strict": "1",
    "data-reactions-enabled": "1",
    "data-emit-metadata": "0",
    "data-input-position": "top",
    "data-theme": theme.value,
    "data-lang": "zh-CN",
    "data-loading": "lazy",
  }).forEach(([key, value]) => script?.setAttribute(key, value ?? ""));
  root.value.appendChild(script);
};

onMounted(() => {
  theme.value = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  mutation = new MutationObserver(() => {
    theme.value = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  });
  mutation.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  if (!configured() || !root.value) return;
  if (!("IntersectionObserver" in window)) {
    nearViewport.value = true;
    return;
  }
  observer = new IntersectionObserver(([entry]) => {
    if (entry?.isIntersecting) {
      nearViewport.value = true;
      observer?.disconnect();
    }
  }, { rootMargin: "600px" });
  observer.observe(root.value);
});

watch(nearViewport, load);
watch(theme, () => {
  if (!script) return;
  script.setAttribute("data-theme", theme.value);
  root.value?.querySelector("iframe")?.setAttribute("data-theme", theme.value);
});

onUnmounted(() => {
  observer?.disconnect();
  mutation?.disconnect();
  script?.remove();
});
</script>

<template>
  <section
    ref="root"
    class="comments"
    aria-label="评论"
  >
    <template v-if="!enabled">
      本文未开放评论。
    </template>
    <template v-else-if="!config.repo || !config.repoId || !config.category || !config.categoryId">
      评论尚未配置。
    </template>
    <template v-else-if="!nearViewport">
      <p>滚动到这里加载评论。</p>
    </template>
    <p v-else-if="!script">
      评论加载中…
    </p>
  </section>
</template>
