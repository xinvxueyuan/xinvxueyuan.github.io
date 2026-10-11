<script setup lang="ts">
import { useHead } from '@unhead/vue'
import PageIntro from '@/components/site/PageIntro.vue'
import { skills } from '@/lib/showcase/content'
import type { Skill } from '@/lib/showcase/types'
import { absoluteUrl } from '@/lib/site'
useHead({ title: '技能', meta: [{ name: 'description', content: '查看 xinvStar 在公开项目中实际使用的技术方向。' }], link: [{ rel: 'canonical', href: absoluteUrl('/skills/') }] })
const skillGroups: readonly { group: Skill['group']; label: string }[] = [{ group: 'frontend', label: '前端与界面' }, { group: 'backend', label: '后端与自动化' }, { group: 'database', label: '数据存储' }, { group: 'tooling', label: '工程工具' }]
</script>
<template>
  <main
    id="main-content"
    class="page-shell showcase-page showcase-page--skills"
    tabindex="-1"
  >
    <PageIntro
      description="不标注虚构的熟练度，只列出能够由公开项目佐证的技术。"
      title="技能"
    /><template
      v-for="group in skillGroups"
      :key="group.group"
    >
      <section
        v-if="skills.filter((skill) => skill.group === group.group).length"
        :aria-labelledby="`skills-${group.group}`"
      >
        <h2 :id="`skills-${group.group}`">
          {{ group.label }}
        </h2><ul>
          <li
            v-for="skill in skills.filter((item) => item.group === group.group)"
            :key="skill.id"
          >
            <strong>{{ skill.name }}</strong><span v-if="skill.summary"> — {{ skill.summary }}</span>
          </li>
        </ul>
      </section>
    </template>
  </main>
</template>
