import type { Metadata } from "next";

import { EmptyState } from "@/components/showcase/empty-state";
import { ExternalLink } from "@/components/showcase/external-link";
import { PageIntro } from "@/components/showcase/page-intro";
import { friends } from "@/lib/showcase/content";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
	alternates: { canonical: absoluteUrl("/friends/") },
	description: "浏览 xinvStar 已确认的朋友站点与友链说明。",
	title: "友链",
};

export default function FriendsPage() {
	return (
		<main className="page-shell" id="main-content" tabIndex={-1}>
			<PageIntro
				description="这里仅收录经过确认的个人站点，不用框架文档或模板链接填充。"
				title="友链"
			/>
			{friends.length === 0 ? (
				<EmptyState
					description="友链列表正在整理中，欢迎先通过关于页面的公开主页与我联系。"
					link={{ href: "/about/", label: "前往关于页面" }}
					title="等待真实的相遇"
				/>
			) : (
				<ul>
					{friends.map((friend) => (
						<li key={friend.id}>
							<article>
								<h2>{friend.name}</h2>
								<p>{friend.description}</p>
								<ExternalLink link={friend.link} />
								{friend.tags.length > 0 ? (
									<p>{friend.tags.join("、")}</p>
								) : null}
							</article>
						</li>
					))}
				</ul>
			)}
		</main>
	);
}
