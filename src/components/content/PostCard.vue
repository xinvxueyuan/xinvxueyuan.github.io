<script setup lang="ts">
import { computed } from "vue";
import { getTaxonomyTermSlug, type Taxonomy } from "@/lib/content/taxonomy";
import type { PostSummary } from "@/lib/content/types";
import type { GeneratedPostSummary } from "@/lib/generated-content";

type CardPost = Omit<PostSummary, "published" | "updated"> & {
  published: string | Date;
  updated?: string | Date;
  dataFile?: string;
};

const props = defineProps<{
  post: CardPost | GeneratedPostSummary;
  taxonomy: Taxonomy;
}>();

const publishedDate = computed(() => props.post.published instanceof Date
  ? props.post.published
  : new Date(props.post.published));
const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  dateStyle: "long",
  timeZone: "UTC",
});
</script>

<template>
  <article
    class="post-card"
    data-post-card
  >
    <p class="post-card__date">
      <time :datetime="publishedDate.toISOString()">
        {{ dateFormatter.format(publishedDate) }}
      </time>
    </p>
    <h3>
      <RouterLink :to="`/posts/${encodeURIComponent(props.post.slug)}/`">
        {{ props.post.title }}
      </RouterLink>
    </h3>
    <p
      v-if="props.post.description"
      class="post-card__description"
    >
      {{ props.post.description }}
    </p>
    <p
      v-if="props.post.category || props.post.tags.length"
      class="post-card__taxonomy"
    >
      <RouterLink
        v-if="props.post.category"
        :to="`/categories/${encodeURIComponent(getTaxonomyTermSlug(props.post.category, props.taxonomy.categories))}/`"
      >
        {{ props.post.category }}
      </RouterLink>
      <RouterLink
        v-for="tag in props.post.tags"
        :key="tag"
        :to="`/tags/${encodeURIComponent(getTaxonomyTermSlug(tag, props.taxonomy.tags))}/`"
      >
        #{{ tag }}
      </RouterLink>
    </p>
  </article>
</template>
