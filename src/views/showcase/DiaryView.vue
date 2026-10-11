<script setup lang="ts">
import { useHead } from '@unhead/vue'
import EmptyState from '@/components/site/EmptyState.vue'
import PageIntro from '@/components/site/PageIntro.vue'
import { diary } from '@/lib/showcase/content'
import { absoluteUrl } from '@/lib/site'
useHead({ title: '日记', meta: [{ name: 'description', content: '阅读 xinvStar 选择公开的日常记录。' }], link: [{ rel: 'canonical', href: absoluteUrl('/diary/') }] })
</script>
<template>
  <main
    id="main-content"
    class="page-shell showcase-page showcase-page--diary"
    tabindex="-1"
  >
    <PageIntro
      description="这里独立保存选择公开的生活片段，不与技术文章混用内容模型。"
      title="日记"
    /><EmptyState
      v-if="diary.length === 0"
      description="暂时没有可公开的日记记录，准备好分享时会按写下的顺序出现在这里。"
      title="日常仍在发生"
    /><ol v-else>
      <li
        v-for="entry in diary"
        :key="entry.id"
      >
        <article>
          <p><time :datetime="entry.publishedAt">{{ entry.publishedAt }}</time></p><p>{{ entry.body }}</p><dl v-if="entry.mood || entry.location">
            <div v-if="entry.mood">
              <dt>心情</dt><dd>{{ entry.mood }}</dd>
            </div><div v-if="entry.location">
              <dt>地点</dt><dd>{{ entry.location }}</dd>
            </div>
          </dl><ul
            v-if="entry.tags.length"
            aria-label="标签"
          >
            <li
              v-for="(tag, index) in entry.tags"
              :key="`${entry.id}:${index}:${tag}`"
            >
              {{ tag }}
            </li>
          </ul><img
            v-for="(image, index) in entry.images"
            :key="`${entry.id}:${index}:${image.src}`"
            :src="image.src"
            :alt="image.alt"
            :width="image.width"
            :height="image.height"
            loading="lazy"
          >
        </article>
      </li>
    </ol>
  </main>
</template>
