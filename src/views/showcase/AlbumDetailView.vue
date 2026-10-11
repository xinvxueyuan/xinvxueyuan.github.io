<script setup lang="ts">
import { computed } from "vue";
import { useHead } from "@unhead/vue";
import { RouterLink, useRoute } from "vue-router";

import AlbumLightbox from "@/components/interactive/AlbumLightbox.vue";
import { albums } from "@/lib/showcase/content";
import { absoluteUrl } from "@/lib/site";

const route = useRoute();
const album = computed(() => albums.find((item) => item.slug === route.params.slug));

useHead(() => ({
  title: album.value?.title ?? "相册不存在",
  meta: [
    { name: "description", content: album.value?.description ?? "找不到这个相册。" },
    ...(!album.value ? [{ name: "robots", content: "noindex" }] : []),
  ],
  link: album.value ? [{
    rel: "canonical",
    href: absoluteUrl(`/albums/${encodeURIComponent(album.value.slug)}/`),
  }] : [],
}));
</script>

<template>
  <main
    id="main-content"
    class="page-shell showcase-page showcase-page--album"
    tabindex="-1"
  >
    <header class="section-heading">
      <RouterLink to="/albums/">
        返回相册
      </RouterLink>
      <h1>{{ album?.title ?? "找不到这个相册" }}</h1>
      <p>{{ album?.description ?? "这个相册可能已经移除，或链接中的 slug 不正确。" }}</p>
    </header>
    <div
      v-if="album"
      :id="`album-gallery-${album.slug}`"
      data-album-gallery
    >
      <a
        v-for="photo in album.photos"
        :key="photo.src"
        :href="photo.src"
        :data-pswp-height="photo.height"
        :data-pswp-width="photo.width"
      >
        <img
          :src="photo.src"
          :alt="photo.alt"
          :width="photo.width"
          :height="photo.height"
          loading="lazy"
        >
      </a>
    </div>
    <AlbumLightbox v-if="album" />
  </main>
</template>
