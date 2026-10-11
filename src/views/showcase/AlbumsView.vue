<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { RouterLink } from 'vue-router'
import PageIntro from '@/components/site/PageIntro.vue'
import { albums } from '@/lib/showcase/content'
import { absoluteUrl } from '@/lib/site'
useHead({ title: '相册', meta: [{ name: 'description', content: '浏览 xinvStar 明确整理并公开的图片相册。' }], link: [{ rel: 'canonical', href: absoluteUrl('/albums/') }] })
</script>
<template>
  <main
    id="main-content"
    class="page-shell showcase-page showcase-page--albums"
    tabindex="-1"
  >
    <PageIntro
      description="每个相册都使用明确的图片清单，不依赖运行时目录扫描。"
      title="相册"
    /><ul>
      <li
        v-for="album in albums"
        :key="album.slug"
      >
        <article>
          <RouterLink :to="`/albums/${album.slug}/`">
            <img
              :src="album.cover.src"
              :alt="album.cover.alt"
              :width="album.cover.width"
              :height="album.cover.height"
              loading="lazy"
            ><h2>{{ album.title }}</h2>
          </RouterLink><p>{{ album.description }}</p>
        </article>
      </li>
    </ul>
  </main>
</template>
