<script setup lang="ts">
import { useHead } from '@unhead/vue'
import ExternalLink from '@/components/site/ExternalLink.vue'
import PageIntro from '@/components/site/PageIntro.vue'
import { devices } from '@/lib/showcase/content'
import type { Device } from '@/lib/showcase/types'
import { absoluteUrl } from '@/lib/site'
useHead({ title: '设备', meta: [{ name: 'description', content: '查看 xinvStar 按实际用途整理的日常设备。' }], link: [{ rel: 'canonical', href: absoluteUrl('/devices/') }] })
const deviceGroups: readonly { category: Device['category']; label: string }[] = [{ category: 'phone', label: '移动设备' }, { category: 'network', label: '网络设备' }, { category: 'computer', label: '计算设备' }, { category: 'other', label: '其他设备' }]
</script>
<template>
  <main
    id="main-content"
    class="page-shell showcase-page showcase-page--devices"
    tabindex="-1"
  >
    <PageIntro
      description="按真实用途记录正在使用的设备，不用品牌标签代替使用场景。"
      title="设备"
    /><template
      v-for="group in deviceGroups"
      :key="group.category"
    >
      <section
        v-if="devices.filter((device) => device.category === group.category).length"
        :aria-labelledby="`devices-${group.category}`"
      >
        <h2 :id="`devices-${group.category}`">
          {{ group.label }}
        </h2><ul>
          <li
            v-for="device in devices.filter((item) => item.category === group.category)"
            :key="device.id"
          >
            <article>
              <img
                :src="device.image.src"
                :alt="device.image.alt"
                :width="device.image.width"
                :height="device.image.height"
                loading="lazy"
              ><h3>{{ device.name }}</h3><p>{{ device.description }}</p><dl><div><dt>规格</dt><dd>{{ device.specs }}</dd></div></dl><ExternalLink
                v-if="device.url"
                :link="device.url"
              />
            </article>
          </li>
        </ul>
      </section>
    </template>
  </main>
</template>
