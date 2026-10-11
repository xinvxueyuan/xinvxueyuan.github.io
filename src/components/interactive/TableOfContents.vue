<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

import { updateVisibleHeadingIds } from "@/lib/visible-headings";
import type { Heading } from "@/lib/markdown/types";

const props = defineProps<{ headings: Heading[] }>();
const activeId = ref("");
let observer: IntersectionObserver | undefined;

onMounted(() => {
  const headings = props.headings
    .map(({ id }) => document.getElementById(id))
    .filter((heading): heading is HTMLElement => Boolean(heading));
  if (!headings.length || !("IntersectionObserver" in window)) return;

  const visible = new Set<string>();
  observer = new IntersectionObserver((entries) => {
    updateVisibleHeadingIds(
      visible,
      entries.map((entry) => ({
        id: entry.target.id,
        isIntersecting: entry.isIntersecting,
      })),
    );
    const current = headings
      .filter((heading) => visible.has(heading.id))
      .sort((left, right) => left.getBoundingClientRect().top - right.getBoundingClientRect().top)[0];
    if (current) activeId.value = current.id;
  }, { rootMargin: "-15% 0px -70%", threshold: 0 });

  headings.forEach((heading) => observer?.observe(heading));
});

onUnmounted(() => observer?.disconnect());
</script>

<template>
  <nav
    v-if="headings.length"
    class="article-toc"
    aria-label="文章目录"
  >
    <p class="article-toc__title">
      文章目录
    </p>
    <ol>
      <li
        v-for="heading in headings"
        :key="heading.id"
        :data-depth="heading.depth"
      >
        <a
          :href="`#${heading.id}`"
          :aria-current="activeId === heading.id ? 'location' : undefined"
        >{{ heading.text }}</a>
      </li>
    </ol>
  </nav>
</template>
