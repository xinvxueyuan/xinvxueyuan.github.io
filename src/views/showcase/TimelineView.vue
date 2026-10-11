<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from '@unhead/vue'
import EmptyState from '@/components/site/EmptyState.vue'
import ExternalLink from '@/components/site/ExternalLink.vue'
import PageIntro from '@/components/site/PageIntro.vue'
import { timeline } from '@/lib/showcase/content'
import { absoluteUrl } from '@/lib/site'
useHead({ title: '时间线', meta: [{ name: 'description', content: '按时间回看 xinvStar 可公开验证的学习与项目节点。' }], link: [{ rel: 'canonical', href: absoluteUrl('/timeline/') }] })
const entries = computed(() => [...timeline].reverse())
</script>
<template>
  <main
    id="main-content"
    class="page-shell showcase-page showcase-page--timeline"
    tabindex="-1"
  >
    <PageIntro
      description="这里只记录有可靠公开依据的项目、学习与工作节点。"
      title="时间线"
    /><EmptyState
      v-if="entries.length === 0"
      description="暂时没有可公开验证的时间线记录，确认事实后会在这里补充。"
      title="记录待补充"
    /><ol v-else>
      <li
        v-for="entry in entries"
        :key="entry.id"
      >
        <article>
          <h2>{{ entry.title }}</h2><p><time :datetime="entry.date">{{ entry.date }}</time></p><p>{{ entry.description }}</p><ExternalLink
            v-for="link in entry.links"
            :key="link.href"
            :link="link"
          />
        </article>
      </li>
    </ol>
  </main>
</template>
