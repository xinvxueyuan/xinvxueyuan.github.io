export const siteConfig = {
	title: "xinvStar",
	description: "把代码、学习与生活编排成一片可阅读的个人星图",
	url: "https://www.xinvstar.xyz/",
	locale: "zh_CN",
	defaultOgImage: "/assets/brand/xinvstar-night-orbit.webp",
} as const;

export function absoluteUrl(pathname: string): string {
	return new URL(pathname, siteConfig.url).toString();
}
