"use client";

import { useCallback, useRef, useState } from "react";

type PagefindResult = {
	data(): Promise<{ excerpt: string; meta: { title?: string }; url: string }>;
};

type Pagefind = {
	search(query: string): Promise<{ results: PagefindResult[] }>;
};

type SearchResult = { excerpt: string; title: string; url: string };

const pagefindUrl = "/pagefind/pagefind.js";

export function createRetryableLoader<T>(importer: () => Promise<T>) {
	let resolved: T | undefined;
	let loading: Promise<T> | undefined;
	return async () => {
		if (resolved) return resolved;
		loading ??= importer();
		try {
			resolved = await loading;
			return resolved;
		} catch (error) {
			loading = undefined;
			throw error;
		}
	};
}

export function Search() {
	const loader = useRef(
		createRetryableLoader(() =>
			import(/* webpackIgnore: true */ pagefindUrl).then(
				(module) => module as unknown as Pagefind,
			),
		),
	);
	const request = useRef(0);
	const [results, setResults] = useState<SearchResult[]>([]);
	const [status, setStatus] = useState("输入关键词开始搜索");

	const loadPagefind = useCallback(async () => {
		return loader.current();
	}, []);

	const search = useCallback(
		async (query: string) => {
			const currentRequest = ++request.current;
			const normalized = query.trim();
			if (!normalized) {
				setResults([]);
				setStatus("输入关键词开始搜索");
				return;
			}
			setStatus("正在搜索…");
			try {
				const engine = await loadPagefind();
				const response = await engine.search(normalized);
				const entries = await Promise.all(
					response.results.map((result) => result.data()),
				);
				if (currentRequest !== request.current) return;
				setResults(
					entries.map((entry) => ({
						excerpt: entry.excerpt,
						title: entry.meta.title ?? entry.url,
						url: entry.url,
					})),
				);
				setStatus(
					entries.length
						? `找到 ${entries.length} 篇文章`
						: "没有找到相关文章",
				);
			} catch {
				if (currentRequest !== request.current) return;
				setResults([]);
				setStatus("搜索暂时不可用，请使用归档页");
			}
		},
		[loadPagefind],
	);

	return (
		<section aria-labelledby="search-title">
			<h1 id="search-title">搜索文章</h1>
			<label htmlFor="site-search">关键词</label>
			<input
				autoComplete="off"
				id="site-search"
				onChange={(event) => void search(event.currentTarget.value)}
				onFocus={() => void loadPagefind().catch(() => undefined)}
				placeholder="标题、分类、标签或正文"
				type="search"
			/>
			<p aria-live="polite">{status}</p>
			{status === "搜索暂时不可用，请使用归档页" ? (
				<p>
					<a href="/archive/">前往文章归档</a>
				</p>
			) : null}
			<ul>
				{results.map((result) => (
					<li key={result.url}>
						<a href={result.url}>{result.title}</a>
						<p>{result.excerpt.replace(/<[^>]*>/gu, "")}</p>
					</li>
				))}
			</ul>
		</section>
	);
}
