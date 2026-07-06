/**
 * Bing HPImageArchive Utility
 *
 * Fetches daily wallpaper metadata from Bing's internal HPImageArchive API.
 * Not an officially documented commercial API — suitable for personal projects.
 *
 * API: https://www.bing.com/HPImageArchive.aspx
 * Docs: format=js | xml | rss
 *       idx=0  → today, idx=1 → yesterday, … (max ~7 days back)
 *       n=1-7  → number of images to return
 *       mkt=zh-CN | en-US | ja-JP | en-GB | de-DE | fr-FR  → region
 */

export interface BingWallpaperItem {
	/** Image title (may be empty for some regions) */
	title: string;
	/** Copyright / attribution text */
	copyright: string;
	/** Copyright link */
	copyrightLink: string;
	/** Full HD image URL (1920×1080) */
	url: string;
	/** Ultra HD image URL (usually 1920×1200 or higher) */
	uhdUrl: string;
	/** Base image URL (without resolution suffix), for custom resolution */
	urlbase: string;
	/** Date in YYYYMMDD format */
	date: string;
}

export interface BingWallpaperConfig {
	enable: boolean;
	/** Region code: zh-CN, en-US, ja-JP, en-GB, de-DE, fr-FR (default: zh-CN) */
	region?: string;
	/** Number of images to fetch, 1-7 (default: 1) */
	count?: number;
	/** Resolution: 'hd' = 1920×1080, 'uhd' = 4K-ish (default: 'hd') */
	resolution?: 'hd' | 'uhd';
}

const BING_API = "https://www.bing.com/HPImageArchive.aspx";

/**
 * Fetch Bing wallpaper items with full metadata.
 */
export async function fetchBingWallpaperItems(
	config: BingWallpaperConfig,
): Promise<BingWallpaperItem[]> {
	if (!config.enable) return [];

	const region = config.region || "zh-CN";
	const count = Math.min(Math.max(config.count || 1, 1), 7);

	const url = `${BING_API}?format=js&idx=0&n=${count}&mkt=${region}`;
	const res = await fetch(url, {
		headers: { Accept: "application/json" },
	});

	if (!res.ok) {
		throw new Error(`Bing HPImageArchive returned ${res.status}`);
	}

	const data: { images: Array<Record<string, string>> } = await res.json();

	if (!data?.images?.length) {
		return [];
	}

	return data.images.map((item) => ({
		title: item.title || "",
		copyright: item.copyright || "",
		copyrightLink: item.copyrightlink || "",
		url: "https://www.bing.com" + item.urlbase + "_1920x1080.jpg",
		uhdUrl: "https://www.bing.com" + item.urlbase + "_UHD.jpg",
		urlbase: "https://www.bing.com" + item.urlbase,
		date: item.startdate || "",
	}));
}

/**
 * Fetch Bing wallpaper image URLs only (for drop-in use with image-api fallback).
 */
export async function fetchBingWallpaperUrls(
	config: BingWallpaperConfig,
): Promise<string[]> {
	const items = await fetchBingWallpaperItems(config);

	if (config.resolution === "uhd") {
		return items.map((i) => i.uhdUrl);
	}
	return items.map((i) => i.url);
}
