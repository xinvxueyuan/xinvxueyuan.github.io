<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const props = defineProps<{ targetId: string }>()

let cleanup: (() => void) | undefined

onMounted(() => {
  const { targetId } = props
  const root = document.getElementById(targetId)
  if (!root) return
  let cancelled = false
  let observer: MutationObserver | undefined
  let renderRevision = 0
  const injectedTools: HTMLElement[] = []
  const injectedFigures: HTMLElement[] = []

  for (const [index, block] of [...root.querySelectorAll<HTMLElement>('pre[data-code-block]')].entries()) {
    if (block.dataset.toolsReady) continue
    block.dataset.toolsReady = 'true'
    block.id ||= `${targetId}-code-${index + 1}`
    const tools = document.createElement('div')
    tools.className = 'code-tools'
    const copy = document.createElement('button')
    copy.type = 'button'; copy.dataset.codeAction = 'copy'; copy.textContent = '复制'
    tools.append(copy)
    if ((block.textContent?.split('\n').length ?? 0) > 12) {
      const collapse = document.createElement('button')
      collapse.type = 'button'; collapse.dataset.codeAction = 'collapse'
      collapse.setAttribute('aria-controls', block.id); collapse.setAttribute('aria-expanded', 'true'); collapse.textContent = '折叠'
      tools.append(collapse)
    }
    block.before(tools); injectedTools.push(tools)
  }
  const onClick = async (event: MouseEvent) => {
    const button = (event.target as Element).closest<HTMLButtonElement>('button[data-code-action]')
    if (!button || !root.contains(button)) return
    const block = button.parentElement?.nextElementSibling as HTMLElement | null
    if (!block?.matches('pre[data-code-block]')) return
    if (button.dataset.codeAction === 'collapse') {
      block.classList.toggle('is-collapsed')
      const collapsed = block.classList.contains('is-collapsed')
      button.setAttribute('aria-expanded', String(!collapsed)); button.textContent = collapsed ? '展开' : '折叠'
      return
    }
    try { await navigator.clipboard.writeText(block.textContent ?? ''); button.textContent = '已复制' }
    catch { button.textContent = '复制失败' }
  }
  root.addEventListener('click', onClick)

  const renderMermaid = async (theme: 'dark' | 'default') => {
    const revision = ++renderRevision
    try {
      const { default: mermaid } = await import('mermaid')
      if (cancelled) return
      mermaid.initialize({ securityLevel: 'strict', startOnLoad: false, theme })
      for (const [index, block] of [...root.querySelectorAll<HTMLElement>('pre[data-mermaid-source]:not([data-mermaid-ready])')].entries()) {
        try {
          const source = block.dataset.mermaidSource ?? block.textContent ?? ''
          const { svg } = await mermaid.render(`mermaid-${index}-${crypto.randomUUID()}`, source)
          if (cancelled || revision !== renderRevision) return
          const figure = document.createElement('figure'); figure.className = 'mermaid-diagram'; figure.dataset.mermaidTheme = theme; figure.innerHTML = svg
          block.hidden = true; block.after(figure); block.dataset.mermaidReady = 'true'; injectedFigures.push(figure)
        } catch { block.hidden = false; block.dataset.mermaidReady = 'error'; block.setAttribute('aria-label', '图表渲染失败，显示 Mermaid 源码') }
      }
    } catch { /* Keep Mermaid source visible when the module cannot load. */ }
  }
  const redraw = () => {
    root.querySelectorAll<HTMLElement>('.mermaid-diagram').forEach((figure) => figure.remove())
    root.querySelectorAll<HTMLElement>('pre[data-mermaid-source]').forEach((block) => { block.hidden = false; delete block.dataset.mermaidReady })
    void renderMermaid(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'default')
  }
  if (root.querySelector('pre[data-mermaid-source]')) {
    observer = new MutationObserver((records) => { if (records.some((record) => record.attributeName === 'data-theme')) redraw() })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    void renderMermaid(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'default')
  }
  cleanup = () => { cancelled = true; renderRevision++; observer?.disconnect(); root.removeEventListener('click', onClick); injectedTools.forEach((tool) => tool.remove()); injectedFigures.forEach((figure) => figure.remove()); root.querySelectorAll<HTMLElement>('pre[data-mermaid-source]').forEach((block) => { block.hidden = false; delete block.dataset.mermaidReady }) }
})
onUnmounted(() => cleanup?.())
</script>
<template>
  <span
    class="article-enhancements"
    aria-hidden="true"
  />
</template>
