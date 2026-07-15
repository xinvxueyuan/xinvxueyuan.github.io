"use client";

import { useEffect } from "react";

export function TocHighlight({ headingIds }: { headingIds: string[] }) {
	useEffect(() => {
		const links = new Map(
			headingIds.map((id) => [
				id,
				document.querySelector<HTMLAnchorElement>(
					`.article-toc a[href="#${CSS.escape(id)}"]`,
				),
			]),
		);
		const headings = headingIds
			.map((id) => document.getElementById(id))
			.filter((value): value is HTMLElement => value !== null);
		if (headings.length === 0 || !("IntersectionObserver" in window))
			return;
		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((entry) => entry.isIntersecting)
					.sort(
						(a, b) =>
							a.boundingClientRect.top - b.boundingClientRect.top,
					)[0];
				if (!visible) return;
				for (const link of links.values())
					link?.removeAttribute("aria-current");
				links
					.get(visible.target.id)
					?.setAttribute("aria-current", "location");
			},
			{ rootMargin: "-15% 0px -70%", threshold: 0 },
		);
		for (const heading of headings) observer.observe(heading);
		return () => observer.disconnect();
	}, [headingIds]);
	return null;
}
