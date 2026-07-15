import type { Metadata } from "next";

import { Search } from "@/components/interactive/search";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
	alternates: { canonical: absoluteUrl("/search/") },
	description: "搜索 xinvStar 的文章正文、分类与标签。",
	title: "搜索",
};

export default function SearchPage() {
	return (
		<main className="page-shell" id="main-content" tabIndex={-1}>
			<Search />
		</main>
	);
}
