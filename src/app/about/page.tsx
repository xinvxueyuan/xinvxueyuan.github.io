import type { Metadata } from "next";
import Link from "next/link";

import { ExternalLink } from "@/components/showcase/external-link";
import { PageIntro } from "@/components/showcase/page-intro";
import { profile } from "@/lib/showcase/content";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
	alternates: { canonical: absoluteUrl("/about/") },
	description: "认识 xinvStar，并从这里前往项目、技术与生活记录。",
	title: "关于",
};

const showcaseRoutes = [
	{ href: "/projects/", label: "项目" },
	{ href: "/timeline/", label: "时间线" },
	{ href: "/skills/", label: "技能" },
	{ href: "/friends/", label: "友链" },
	{ href: "/devices/", label: "设备" },
	{ href: "/diary/", label: "日记" },
	{ href: "/albums/", label: "相册" },
] as const;

export default function AboutPage() {
	return (
		<main
			className="page-shell showcase-page showcase-page--about"
			id="main-content"
			tabIndex={-1}
		>
			<PageIntro
				description={profile.headline}
				title={`关于 ${profile.name}`}
			/>
			<section aria-labelledby="about-introduction">
				<h2 id="about-introduction">在这里写些什么</h2>
				<p>{profile.introduction}</p>
				{profile.links.map((link) => (
					<ExternalLink key={link.href} link={link} />
				))}
			</section>
			<nav aria-labelledby="showcase-navigation">
				<h2 id="showcase-navigation">继续认识我</h2>
				<ul>
					{showcaseRoutes.map((route) => (
						<li key={route.href}>
							<Link href={route.href}>{route.label}</Link>
						</li>
					))}
				</ul>
			</nav>
		</main>
	);
}
