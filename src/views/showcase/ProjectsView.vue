<script setup lang="ts">
import { useHead } from "@unhead/vue";

import ExternalLink from "@/components/site/ExternalLink.vue";
import PageIntro from "@/components/site/PageIntro.vue";
import { projects } from "@/lib/showcase/content";
import type { ProjectStatus } from "@/lib/showcase/types";
import { absoluteUrl } from "@/lib/site";

useHead({
  title: "项目",
  meta: [{ name: "description", content: "浏览 xinvStar 正在维护的公开项目。" }],
  link: [{ rel: "canonical", href: absoluteUrl("/projects/") }],
});

const statusLabels: Record<ProjectStatus, string> = {
  completed: "已完成",
  "in-progress": "持续维护",
  planned: "计划中",
};
</script>

<template>
  <main
    id="main-content"
    class="page-shell showcase-page showcase-page--projects"
    tabindex="-1"
  >
    <PageIntro
      description="这些项目连接着技术写作、开源协作与日常实践。"
      title="项目"
    />
    <div>
      <article
        v-for="project in projects"
        :key="project.slug"
        class="project-card"
        :class="{ 'project-card--has-cover': project.cover }"
      >
        <img
          v-if="project.cover"
          :src="project.cover.src"
          :alt="project.cover.alt"
          :width="project.cover.width"
          :height="project.cover.height"
          loading="lazy"
        >
        <h2>{{ project.title }}</h2>
        <p>{{ project.description }}</p>
        <p>
          状态：{{ statusLabels[project.status] }}{{ project.featured ? " · 精选项目" : "" }}
        </p>
        <ul :aria-label="`${project.title} 技术`">
          <li
            v-for="technology in project.technologies"
            :key="technology"
          >
            {{ technology }}
          </li>
        </ul>
        <p>
          <template
            v-for="(link, index) in project.links"
            :key="link.href"
          >
            <span v-if="index > 0"> · </span>
            <ExternalLink :link="link" />
          </template>
        </p>
      </article>
    </div>
  </main>
</template>
