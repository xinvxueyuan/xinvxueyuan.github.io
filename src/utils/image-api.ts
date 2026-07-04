/**
 * Image API utility — fetches banner/wallpaper image URLs with fallback support.
 *
 * Primary source: text-based API (one image URL per line).
 * Fallback source: alcy-api JSON endpoint (compatible with t.alcy.cc format).
 */

export interface ImageApiConfig {
	enable: boolean;
	url: string;
	fallbackUrl?: string;
	fallbackCategory?: string;
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

/**
 * Fetch image URLs from the primary API (text format: one URL per line).
 * Falls back to alcy-api JSON endpoint on failure.
 */
async function fetchFromTextApi(url: string): Promise<string[]> {
	const response = await fetch(url);
	const text = await response.text();
	return text.split("\n").map((l) => l.trim()).filter(Boolean);
}

/**
 * Fetch image URLs from alcy-api JSON endpoint.
 * Endpoint: /image/json?<category>=<count>
 */
async function fetchFromAlcyApi(
	baseUrl: string,
	category: string,
	count: number = 4,
): Promise<string[]> {
	// Try JSON endpoint first
	const jsonUrl = `${baseUrl.replace(/\/$/, "")}/image/json?${category}=${count}`;
	const response = await fetch(jsonUrl, {
		headers: { Accept: "application/json" },
	});
	if (!response.ok) {
		throw new Error(`Alcy API returned ${response.status}`);
	}
	const body: AlcyJsonResponse = await response.json();
	const dataList = Array.isArray(body.data) ? body.data : [body.data];
	return dataList.map((item) => item.link).filter(Boolean);
}

/**
 * Fetch image URLs with fallback support.
 *
 * 1. If primary imageApi is enabled and URL is configured, try it first.
 * 2. On failure, try alcy-api fallback (if configured).
 *
 * Returns an array of image URL strings, or empty array if all sources fail.
 */
export async function fetchImageUrls(
	config: ImageApiConfig,
): Promise<string[]> {
	if (!config.enable) return [];

	const errors: string[] = [];

	// Try primary API
	if (config.url) {
		try {
			const urls = await fetchFromTextApi(config.url);
			if (urls.length > 0) return urls;
		} catch (err) {
			errors.push(`Primary API: ${(err as Error).message}`);
		}
	}

	// Fallback to alcy-api
	if (config.fallbackUrl) {
		try {
			const category = config.fallbackCategory || "pc";
			const urls = await fetchFromAlcyApi(config.fallbackUrl, category);
			if (urls.length > 0) {
				console.log(`[image-api] Using alcy-api fallback (${urls.length} images)`);
				return urls;
			}
		} catch (err) {
			errors.push(`Fallback alcy-api: ${(err as Error).message}`);
		}
	}

	if (errors.length > 0) {
		console.warn("[image-api] All sources failed:", errors.join(" | "));
	}

	return [];
}
