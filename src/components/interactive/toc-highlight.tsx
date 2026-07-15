"use client";

import { useEffect } from "react";

export function updateVisibleHeadingIds(
	visibleIds: Set<string>,
	entries: ReadonlyArray<{ id: string; isIntersecting: boolean }>,
) {
	for (const entry of entries) {
		if (entry.isIntersecting) visibleIds.add(entry.id);
		else visibleIds.delete(entry.id);
	}
}

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
		const visibleIds = new Set<string>();
		const observer = new IntersectionObserver(
			(entries) => {
				updateVisibleHeadingIds(
					visibleIds,
					entries.map((entry) => ({
						id: entry.target.id,
						isIntersecting: entry.isIntersecting,
					})),
				);
				const visible = headings
					.filter((heading) => visibleIds.has(heading.id))
					.sort(
						(a, b) =>
							a.getBoundingClientRect().top -
							b.getBoundingClientRect().top,
					)[0];
				if (!visible) return;
				for (const link of links.values())
					link?.removeAttribute("aria-current");
				links.get(visible.id)?.setAttribute("aria-current", "location");
			},
			{ rootMargin: "-15% 0px -70%", threshold: 0 },
		);
		for (const heading of headings) observer.observe(heading);
		return () => observer.disconnect();
	}, [headingIds]);
	return null;
}
