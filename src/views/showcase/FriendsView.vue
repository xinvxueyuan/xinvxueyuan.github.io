<script setup lang="ts">
import { useHead } from '@unhead/vue'
import EmptyState from '@/components/site/EmptyState.vue'
import ExternalLink from '@/components/site/ExternalLink.vue'
import PageIntro from '@/components/site/PageIntro.vue'
import { friends } from '@/lib/showcase/content'
import { absoluteUrl } from '@/lib/site'
useHead({ title: '友链', meta: [{ name: 'description', content: '浏览 xinvStar 已确认的朋友站点与友链说明。' }], link: [{ rel: 'canonical', href: absoluteUrl('/friends/') }] })
</script>
<template>
  <main
    id="main-content"
    class="page-shell showcase-page showcase-page--friends"
    tabindex="-1"
  >
    <PageIntro
      description="这里仅收录经过确认的个人站点，不用框架文档或模板链接填充。"
      title="友链"
    /><EmptyState
      v-if="friends.length === 0"
      description="友链列表正在整理中，欢迎先通过关于页面的公开主页与我联系。"
      title="等待真实的相遇"
      :link="{ href: '/about/', label: '前往关于页面' }"
    /><ul v-else>
      <li
        v-for="friend in friends"
        :key="friend.id"
      >
        <article>
          <img
            v-if="friend.avatar"
            class="friend-card__avatar"
            :src="friend.avatar.src"
            :alt="friend.avatar.alt"
            :width="friend.avatar.width"
            :height="friend.avatar.height"
            loading="lazy"
          ><h2>{{ friend.name }}</h2><p>{{ friend.description }}</p><ExternalLink :link="friend.url" /><p v-if="friend.tags.length">
            {{ friend.tags.join('、') }}
          </p>
        </article>
      </li>
    </ul>
  </main>
</template>
