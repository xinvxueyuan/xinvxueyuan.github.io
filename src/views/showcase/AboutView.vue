<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { RouterLink } from 'vue-router'
import ExternalLink from '@/components/site/ExternalLink.vue'
import PageIntro from '@/components/site/PageIntro.vue'
import { profile } from '@/lib/showcase/content'
import { absoluteUrl } from '@/lib/site'
useHead({ title: '关于', meta: [{ name: 'description', content: '认识 xinvStar，并从这里前往项目、技术与生活记录。' }], link: [{ rel: 'canonical', href: absoluteUrl('/about/') }] })
const showcaseRoutes = [{ href: '/projects/', label: '项目' }, { href: '/timeline/', label: '时间线' }, { href: '/skills/', label: '技能' }, { href: '/friends/', label: '友链' }, { href: '/devices/', label: '设备' }, { href: '/diary/', label: '日记' }, { href: '/albums/', label: '相册' }] as const
</script>
<template>
  <main
    id="main-content"
    class="page-shell showcase-page showcase-page--about"
    tabindex="-1"
  >
    <PageIntro
      :description="profile.headline"
      :title="`关于 ${profile.name}`"
    />
    <section aria-labelledby="about-introduction">
      <h2 id="about-introduction">
        在这里写些什么
      </h2><p>{{ profile.introduction }}</p><ExternalLink
        v-for="link in profile.links"
        :key="link.href"
        :link="link"
      />
    </section>
    <nav aria-labelledby="showcase-navigation">
      <h2 id="showcase-navigation">
        继续认识我
      </h2><ul>
        <li
          v-for="route in showcaseRoutes"
          :key="route.href"
        >
          <RouterLink :to="route.href">
            {{ route.label }}
          </RouterLink>
        </li>
      </ul>
    </nav>
  </main>
</template>
