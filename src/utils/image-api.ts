/**
 * Image API utility — fetches banner/wallpaper image URLs with multi-source fallback.
 *
 * Auto-detects response format:
 *   - Starts with '{' → JSON (t.alcy.cc / alcy-api), extracts data[].link
 *   - Otherwise → text (one URL per line, PicFlow-compatible)
 *
 * Now also supports source-routed dispatch for the wallpaper source switching feature.
 */
import { fetchBingWallpaperUrls, fetchBingWallpaperItems } from "./bing-wallpaper";
import type { BingWallpaperConfig } from "./bing-wallpaper";
import type { WallpaperSource } from "../types/config";

export interface ImageApiConfig {
	enable: boolean;
	url: string;
	fallbackUrl?: string;
	fallbackCategory?: string;
	builtinProxy?: boolean;
	builtinCategory?: string;
	builtinCount?: number;
}

interface AlcyJsonItem {
	id: string;
	link: string;
	category: string;
}
interface AlcyJsonResponse {
	code: number;
	category: string;
	count: number;
	data: AlcyJsonItem | AlcyJsonItem[];
}

const T_ALCY_CC = "https://t.alcy.cc/json";

// ---- Core fetch helpers ----

async function fetchFromUrl(url: string): Promise<string[]> {
	const res = await fetch(url, {
		headers: { Accept: "application/json, text/plain" },
	});
	const text = await res.text();

	if (text.trim().startsWith("{")) {
		const body: AlcyJsonResponse = JSON.parse(text);
		const dataList = Array.isArray(body.data) ? body.data : [body.data];
		return dataList
			.map((item) => item.link)
			.filter(Boolean);
	}

	return text
		.split("\n")
		.map((l) => l.trim())
		.filter(Boolean);
}

// ---- Multi-source fallback ----

type SourceFn = () => Promise<string[]>;

async function trySources(
	sources: Array<{ label: string; fn: SourceFn }>,
): Promise<string[]> {
	const errors: string[] = [];
	for (const { label, fn } of sources) {
		try {
			const urls = await fn();
			if (urls.length > 0) {
				console.log(`[image-api] ${label} (${urls.length} images)`);
				return urls;
			}
		} catch (err) {
			errors.push(`${label}: ${(err as Error).message}`);
		}
	}
	if (errors.length > 0)
		console.warn("[image-api] All sources failed:", errors.join(" | "));
	return [];
}

// ---- Source-routed dispatch (for wallpaper source switching) ----

/**
 * Fetch wallpaper URLs from a specific source definition.
 */
export async function fetchFromWallpaperSource(
	source: WallpaperSource,
): Promise<string[]> {
	switch (source.type) {
		case "t-alcy-cc": {
			const category = (source.params?.category as string) || "pc";
			const count = (source.params?.count as number) || 4;
			return fetchFromUrl(`${T_ALCY_CC}?${category}=${count}`);
		}
		case "bing": {
			const config: BingWallpaperConfig = {
				enable: true,
				region: (source.params?.region as string) || "zh-CN",
				count: (source.params?.count as number) || 1,
				resolution: (source.params?.resolution as "hd" | "uhd") || "hd",
			};
			return fetchBingWallpaperUrls(config);
		}
		case "default":
			return [];
		default:
			return [];
	}
}

/**
 * Fetch wallpaper items (with metadata) from a specific source.
 * Currently only Bing returns rich metadata; other sources return URLs only.
 */
export async function fetchWallpaperItems(
	source: WallpaperSource,
): Promise<Array<{ url: string; title?: string; copyright?: string; date?: string }>> {
	switch (source.type) {
		case "bing": {
			const config: BingWallpaperConfig = {
				enable: true,
				region: (source.params?.region as string) || "zh-CN",
				count: (source.params?.count as number) || 1,
				resolution: (source.params?.resolution as "hd" | "uhd") || "hd",
			};
			const items = await fetchBingWallpaperItems(config);
			return items.map((i) => ({
				url: i.url,
				title: i.title,
				copyright: i.copyright,
				date: i.date,
			}));
		}
		case "t-alcy-cc": {
			const category = (source.params?.category as string) || "pc";
			const count = (source.params?.count as number) || 4;
			const urls = await fetchFromUrl(`${T_ALCY_CC}?${category}=${count}`);
			return urls.map((url) => ({ url }));
		}
		case "default":
			return [];
		default:
			return [];
	}
}

// ---- Legacy fallback chain (backward compatible) ----

/**
 * Fetch image URLs from configured sources in priority order:
 *   1. Primary URL → 2. Fallback URL → 3. Built-in t.alcy.cc
 */
export async function fetchImageUrls(
	config: ImageApiConfig,
): Promise<string[]> {
	if (!config.enable) return [];

	const sources: Array<{ label: string; fn: SourceFn }> = [];

	if (config.url) {
		sources.push({ label: "Primary", fn: () => fetchFromUrl(config.url) });
	}
	if (config.fallbackUrl) {
		sources.push({
			label: "Fallback",
			fn: () => fetchFromUrl(config.fallbackUrl!),
		});
	}
	if (config.builtinProxy !== false) {
		const category = config.builtinCategory || config.fallbackCategory || "pc";
		const count = config.builtinCount || 4;
		sources.push({
			label: `Built-in t.alcy.cc (${category})`,
			fn: () => fetchFromUrl(`${T_ALCY_CC}?${category}=${count}`),
		});
	}

	return trySources(sources);
}
