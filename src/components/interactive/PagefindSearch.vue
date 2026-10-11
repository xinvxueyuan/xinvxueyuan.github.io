<script setup lang="ts">
import { onMounted, ref } from "vue";
import { KunCheckBoxGroup, KunSelect } from "@kungal/ui-vue";

import { createRetryableLoader } from "@/lib/retryable-loader";

type SearchScope = "title" | "content";
type SearchScopeSelection = "all" | SearchScope;
type TimeSort = "relevance" | "published" | "updated";
type SortDirection = "asc" | "desc";
type PagefindSearchOptions = {
	filters: Record<string, string[]>;
	sort?: Record<string, SortDirection>;
};
type PagefindResultData = {
	excerpt: string;
	meta: {
		canonical_url?: string;
		published?: string;
		title?: string;
		updated?: string;
	};
	url: string;
};
type PagefindResult = {
	score: number;
	data(): Promise<PagefindResultData>;
};
type Pagefind = {
	search(
		query: string,
		options: PagefindSearchOptions,
	): Promise<{ results: PagefindResult[] }>;
};

const props = defineProps<{ initialQuery?: string }>();
const query = ref(props.initialQuery ?? "");
const results = ref<{ excerpt: string; title: string; url: string }[]>([]);
const status = ref("输入关键词开始搜索");
const selectedScopes = ref<SearchScopeSelection[]>(["all"]);
const timeSort = ref<TimeSort>("relevance");
const sortDirection = ref<SortDirection>("desc");
const scopeOptions: { value: SearchScopeSelection; label: string }[] = [
	{ value: "all", label: "全部" },
	{ value: "title", label: "按标题" },
	{ value: "content", label: "按内容" },
];
const timeSortOptions: { value: TimeSort; label: string }[] = [
	{ value: "relevance", label: "相关性排序" },
	{ value: "published", label: "发布时间" },
	{ value: "updated", label: "更新时间" },
];
const sortDirectionOptions: { value: SortDirection; label: string }[] = [
	{ value: "desc", label: "倒序（从新到旧）" },
	{ value: "asc", label: "正序（从早到晚）" },
];
let request = 0;

const loadPagefind = createRetryableLoader<Pagefind>(async () => {
	const generatedBundle = "/pagefind/pagefind.js";
	return (await import(/* @vite-ignore */ generatedBundle)) as Pagefind;
});

const search = async (value: string): Promise<void> => {
	query.value = value;
	const current = ++request;
	const normalized = value.trim();
	if (!normalized) {
		results.value = [];
		status.value = "输入关键词开始搜索";
		return;
	}

	const scopes: SearchScope[] = selectedScopes.value.includes("all")
		? ["title", "content"]
		: selectedScopes.value.filter(
				(scope): scope is SearchScope => scope !== "all",
			);
	const currentSort = timeSort.value;
	const currentDirection = sortDirection.value;
	const sort =
		currentSort === "relevance"
			? undefined
			: { [currentSort]: currentDirection };

	status.value = "正在搜索…";
	try {
		const pagefind = await loadPagefind();
		const responses = await Promise.all(
			(scopes.length ? scopes : ["title", "content"]).map((scope) =>
				pagefind.search(normalized, {
					filters: { search_scope: [scope] },
					...(sort ? { sort } : {}),
				}),
			),
		);
		const scoredEntries = await Promise.all(
			responses.flatMap((response) =>
				response.results.map(async (result) => ({
					entry: await result.data(),
					score: result.score,
				})),
			),
		);
		if (current !== request) return;

		const uniqueEntries = new Map<string, PagefindResultData & { score: number }>();
		for (const { entry, score } of scoredEntries) {
			const url = entry.meta.canonical_url ?? entry.url;
			const existing = uniqueEntries.get(url);
			if (!existing || score > existing.score) {
				uniqueEntries.set(url, { ...entry, score });
			}
		}
		const sortedEntries = [...uniqueEntries.values()].sort((left, right) => {
			if (currentSort !== "relevance") {
				const dateOrder = (left.meta[currentSort] ?? "").localeCompare(
					right.meta[currentSort] ?? "",
				);
				if (dateOrder !== 0) {
					return currentDirection === "asc" ? dateOrder : -dateOrder;
				}
			}
			return right.score - left.score;
		});
		results.value = sortedEntries.map((entry) => ({
			excerpt: entry.excerpt,
			title: entry.meta.title ?? entry.url,
			url: entry.meta.canonical_url ?? entry.url,
		}));
		status.value = results.value.length
			? `找到 ${results.value.length} 篇文章`
			: "没有找到相关文章";
	} catch {
		if (current !== request) return;
		results.value = [];
		status.value = "搜索暂时不可用，请使用归档页";
	}
};

const updateScopes = (scopes: SearchScopeSelection[]): void => {
	const previouslyAll = selectedScopes.value.includes("all");
	const scopedOptions = scopes.filter(
		(scope): scope is SearchScope => scope !== "all",
	);
	const allWasSelected = scopes.includes("all");
	selectedScopes.value =
		scopes.length === 0 ||
		(allWasSelected && (!previouslyAll || scopes.length === 1)) ||
		scopedOptions.length === 2
			? ["all"]
			: scopedOptions;
	void search(query.value);
};

const updateTimeSort = (value: string | number): void => {
	if (value === "relevance" || value === "published" || value === "updated") {
		timeSort.value = value;
		void search(query.value);
	}
};

const updateSortDirection = (value: string | number): void => {
	if (value === "asc" || value === "desc") {
		sortDirection.value = value;
		void search(query.value);
	}
};

onMounted(() => {
	if (query.value) void search(query.value);
});
</script>

<template>
  <section
    role="search"
    aria-labelledby="search-title"
  >
    <h1 id="search-title">
      搜索文章
    </h1>
    <label for="pagefind-query">关键词</label>
    <input
      id="pagefind-query"
      v-model="query"
      type="search"
      autocomplete="off"
      placeholder="标题、分类、标签或正文"
      @focus="void loadPagefind().catch(() => undefined)"
      @input="void search(query)"
    >

    <div class="pagefind-search__filters">
      <KunCheckBoxGroup
        :model-value="selectedScopes"
        :options="scopeOptions"
        label="相关性"
        orientation="horizontal"
        class-name="pagefind-search__scope"
        @change="updateScopes"
      />
      <KunSelect
        :model-value="timeSort"
        :options="timeSortOptions"
        label="按时间"
        class-name="pagefind-search__select"
        @set="updateTimeSort"
      />
      <KunSelect
        :model-value="sortDirection"
        :options="sortDirectionOptions"
        label="顺序"
        :disabled="timeSort === 'relevance'"
        class-name="pagefind-search__select"
        @set="updateSortDirection"
      />
    </div>

    <p aria-live="polite">
      {{ status }}
    </p>
    <p v-if="status === '搜索暂时不可用，请使用归档页'">
      <a href="/archive/">前往文章归档</a>
    </p>
    <ul>
      <li
        v-for="result in results"
        :key="result.url"
      >
        <a :href="result.url">{{ result.title }}</a>
        <p>{{ result.excerpt.replace(/<[^>]*>/gu, "") }}</p>
      </li>
    </ul>
  </section>
</template>
