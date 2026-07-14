# 外部依赖

只记录环境变量名称，不记录值。用途与失败/离线行为无法从代码确认时明确标为 unknown。

| 服务 | 用途 | 调用文件 | 认证变量 | 阶段 | 失败表现 | 离线回退 | 迁移处置 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| api.bgm.tv | unclassified external service | scripts/compress-fonts.js<br>scripts/update-bangumi.mjs | CONTENT_DIR, ENABLE_CONTENT_SYNC | build-time-or-maintenance | unknown; inspect call site | unknown | review |
| api.bilibili.com | Bilibili anime data | scripts/update-bilibili.mjs | BILI_SESSDATA | build-time-or-maintenance | unknown; inspect call site | tracked generated data | preserve-or-cache |
| api.github.com | GitHub repository card metadata | src/plugins/rehype-component-github-card.mjs | 未发现 | build-time-or-server-render | unknown; inspect call site | render link without enriched card | preserve-with-build-cache |
| api.iconify.design | unclassified external service | src/layouts/partials/HeadTags.astro | 未发现 | runtime-or-client | unknown; inspect call site | unknown | review |
| api.indexnow.org | IndexNow search notification | scripts/indexnow-submit.js | INDEXNOW_HOST, INDEXNOW_KEY | build-time-or-maintenance | unknown; inspect call site | skip submission | preserve-as-explicit-publish-step |
| astro.build | unclassified external service | src/components/organisms/footer/Footer.astro | 未发现 | runtime-or-client | unknown; inspect call site | unknown | review |
| avatars.githubusercontent.com | unclassified external service | src/data/friends.ts | 未发现 | runtime-or-client | unknown; inspect call site | unknown | review |
| bgm.tv | Bangumi metadata | scripts/update-bangumi.mjs | 未发现 | build-time-or-maintenance | unknown; inspect call site | tracked generated data | preserve-or-cache |
| cdn.jsdelivr.net | client asset CDN | src/plugins/mermaid-render-script.js | 未发现 | build-time-or-server-render | unknown; inspect call site | local asset required | replace-with-bundled-asset-where-possible |
| code.iconify.design | Iconify runtime icon API | src/components/misc/IconifyLoader.astro<br>src/utils/icon-loader.ts | 未发现 | runtime-or-client | unknown; inspect call site | local icon set | prefer-build-time-icons |
| fonts.googleapis.com | Google Fonts stylesheet | src/layouts/Layout.astro<br>src/pages/og/[...slug].png.ts<br>src/styles/main.css | 未发现 | runtime-or-client | unknown; inspect call site | system font stack | replace-with-next-font-or-local |
| fonts.gstatic.com | unclassified external service | src/layouts/Layout.astro | 未发现 | runtime-or-client | unknown; inspect call site | unknown | review |
| giscus.app | Giscus comments | src/components/comment/Giscus.astro | 未发现 | runtime-or-client | unknown; inspect call site | comments unavailable | preserve |
| github.com | unclassified external service | astro.config.mjs<br>src/components/organisms/footer/Footer.astro<br>src/data/projects.ts<br>src/plugins/rehype-component-github-card.mjs | NODE_ENV | runtime-or-client | unknown; inspect call site | unknown | review |
| icp.gov.moe | unclassified external service | src/config.ts | 未发现 | runtime-or-client | unknown; inspect call site | unknown | review |
| images.weserv.nl | remote image proxy | src/components/misc/utils/poster-renderer.ts<br>src/config.ts | 未发现 | runtime-or-client | unknown; inspect call site | original image URL | review |
| meting.mysqil.com | Meting music metadata | src/config.ts | 未发现 | runtime-or-client | unknown; inspect call site | music metadata unavailable | review |
| picsum.photos | unclassified external service | public/images/albums/ExternalExample/info.json | 未发现 | runtime-or-client | unknown; inspect call site | unknown | review |
| raw.githubusercontent.com | remote configuration or asset | lighthouserc.json | 未发现 | runtime-or-client | unknown; inspect call site | local snapshot | pin-or-vendor |
| reactjs.org | unclassified external service | src/data/friends.ts | 未发现 | runtime-or-client | unknown; inspect call site | unknown | review |
| schema.org | unclassified external service | src/pages/[...permalink].astro<br>src/pages/posts/[...slug].astro | 未发现 | runtime-or-client | unknown; inspect call site | unknown | review |
| t.alcy.cc | wallpaper API | scripts/fetch-wallpapers.js<br>src/config.ts<br>src/utils/image-api.ts | 未发现 | runtime-or-client | unknown; inspect call site | tracked wallpaper list | preserve-with-fallback |
| tailwindcss.com | unclassified external service | src/data/friends.ts | 未发现 | runtime-or-client | unknown; inspect call site | unknown | review |
| tc.alcy.cc | wallpaper image host | public/data/wallpapers.json | 未发现 | runtime-or-client | unknown; inspect call site | tracked wallpaper list | preserve-with-fallback |
| twikoo.vercel.app | Twikoo comment service | src/config.ts | 未发现 | runtime-or-client | unknown; inspect call site | comments unavailable | preserve-with-fail-open |
| unpkg.com | client asset CDN | src/plugins/mermaid-render-script.js | 未发现 | build-time-or-server-render | unknown; inspect call site | local asset required | replace-with-bundled-asset |
| www.bilibili.com | Bilibili public pages/API | scripts/update-bilibili.mjs<br>src/data/anime.ts | BILI_SESSDATA | runtime-or-client | unknown; inspect call site | tracked generated data | preserve-or-cache |
| www.bilibili.uno | unclassified external service | scripts/compress-fonts.js | CONTENT_DIR, ENABLE_CONTENT_SYNC | build-time-or-maintenance | unknown; inspect call site | unknown | review |
| www.bing.com | Bing wallpaper source | public/data/wallpapers.json<br>scripts/fetch-wallpapers.js<br>src/utils/bing-wallpaper.ts | 未发现 | runtime-or-client | unknown; inspect call site | tracked wallpaper list | preserve-with-fallback |
| www.clarity.ms | Microsoft Clarity analytics | src/layouts/partials/AnalyticsScripts.astro | 未发现 | runtime-or-client | unknown; inspect call site | analytics disabled | review-analytics-consent |
| www.googletagmanager.com | Google analytics/tag delivery | src/layouts/Layout.astro<br>src/layouts/partials/AnalyticsScripts.astro | 未发现 | runtime-or-client | unknown; inspect call site | analytics disabled | review-analytics-consent |
| www.typescriptlang.org | unclassified external service | src/data/friends.ts | 未发现 | runtime-or-client | unknown; inspect call site | unknown | review |
| www.vivo.com.cn | unclassified external service | src/data/devices.ts | 未发现 | runtime-or-client | unknown; inspect call site | unknown | review |
| www.w3.org | unclassified external service | src/pages/atom.xml.ts | 未发现 | build-time-or-server-render | unknown; inspect call site | unknown | review |
| www.xinvstar.xyz | canonical production site | src/data/friends.ts<br>src/data/projects.ts | 未发现 | runtime-or-client | unknown; inspect call site | not applicable | preserve |
| www.ztemall.com | unclassified external service | src/data/devices.ts | 未发现 | runtime-or-client | unknown; inspect call site | unknown | review |
| xinvstar.xyz | canonical production site | src/config.ts | 未发现 | runtime-or-client | unknown; inspect call site | not applicable | preserve |
