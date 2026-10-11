<template>
  <footer class="site-footer">
    <div class="site-footer__inner">
      <p class="site-footer__brand">
        xinvStar <span>·</span> 夜航问讯站
      </p>
      <p class="site-footer__note">
        把代码、学习与生活编排成一片可阅读的个人星图。
      </p>
      <nav
        class="footer-links"
        aria-label="页脚导航"
      >
        <RouterLink to="/about/">
          关于
        </RouterLink>
        <RouterLink to="/friends/">
          友链
        </RouterLink>
        <a href="/atom.xml">Atom</a>
        <a href="/rss.xml">RSS</a>
        <a href="/sitemap.xml">站点地图</a>
      </nav>
    </div>
  </footer>
</template>
