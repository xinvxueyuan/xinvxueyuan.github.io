"use client";

import { lazy, Suspense, useEffect, useRef, useState } from "react";

const LazyGiscus = lazy(() => import("@giscus/react"));

const config = {
	category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY,
	categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID,
	repo: process.env.NEXT_PUBLIC_GISCUS_REPO,
	repoId: process.env.NEXT_PUBLIC_GISCUS_REPO_ID,
};

export function Comments({
	enabled,
	pathname,
}: {
	enabled: boolean;
	pathname: string;
}) {
	const root = useRef<HTMLElement>(null);
	const [nearViewport, setNearViewport] = useState(false);
	const [theme, setTheme] = useState("light");
	useEffect(() => {
		const frame = requestAnimationFrame(() =>
			setTheme(
				document.documentElement.dataset.theme === "dark"
					? "dark"
					: "light",
			),
		);
		const mutation = new MutationObserver(() =>
			setTheme(
				document.documentElement.dataset.theme === "dark"
					? "dark"
					: "light",
			),
		);
		mutation.observe(document.documentElement, {
			attributeFilter: ["data-theme"],
			attributes: true,
		});
		const element = root.current;
		if (!element || !("IntersectionObserver" in window)) {
			const fallbackFrame = requestAnimationFrame(() =>
				setNearViewport(true),
			);
			return () => {
				cancelAnimationFrame(frame);
				cancelAnimationFrame(fallbackFrame);
				mutation.disconnect();
			};
		}
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) {
					setNearViewport(true);
					observer.disconnect();
				}
			},
			{ rootMargin: "600px" },
		);
		observer.observe(element);
		return () => {
			cancelAnimationFrame(frame);
			observer.disconnect();
			mutation.disconnect();
		};
	}, []);
	if (!enabled)
		return (
			<section aria-label="评论" className="comments" ref={root}>
				本文未开放评论。
			</section>
		);
	if (
		!config.repo ||
		!config.repoId ||
		!config.category ||
		!config.categoryId
	)
		return (
			<section aria-label="评论" className="comments" ref={root}>
				评论尚未配置。
			</section>
		);
	return (
		<section aria-label="评论" className="comments" ref={root}>
			{nearViewport ? (
				<Suspense fallback={<p>评论加载中…</p>}>
					<LazyGiscus
						category={config.category}
						categoryId={config.categoryId}
						emitMetadata="0"
						inputPosition="top"
						lang="zh-CN"
						loading="lazy"
						mapping="pathname"
						reactionsEnabled="1"
						repo={config.repo as `${string}/${string}`}
						repoId={config.repoId}
						strict="1"
						theme={theme}
						term={pathname}
					/>
				</Suspense>
			) : (
				<p>滚动到这里加载评论。</p>
			)}
		</section>
	);
}
