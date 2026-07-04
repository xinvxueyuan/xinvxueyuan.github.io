/**
 * Image API utility — fetches banner/wallpaper image URLs with multi-source support.
 *
 * Supports two response formats:
 *   1. Text format — one image URL per line (PicFlow-compatible)
 *   2. JSON format — t.alcy.cc / alcy-api JSON response
 *
 * Sources (tried in order until one succeeds):
 *   1. Primary URL (config.url)
 *   2. Fallback URL (config.fallbackUrl)
 *   3. Built-in t.alcy.cc proxy (directly calls https://t.alcy.cc/json)
 */

export interface ImageApiConfig {
	enable: boolean;
	url: string;
	fallbackUrl?: string;
	fallbackCategory?: string;
	/** Use built-in t.alcy.cc direct proxy as final fallback */
	builtinProxy?: boolean;
	/** Category for built-in proxy (default: "pc") */
	builtinCategory?: string;
	/** Image count for built-in proxy (default: 4) */
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

/**
 * Fetch from a URL and auto-detect response format.
 * - Starts with '{' → parse as t.alcy.cc JSON, extract data[].link
 * - Otherwise → split by newlines (PicFlow text format)
 */
async function fetchFromUrl(url: string): Promise<string[]> {
	const response = await fetch(url, {
		headers: { Accept: "application/json, text/plain" },
	});
	const text = await response.text();

	// Auto-detect JSON (t.alcy.cc / alcy-api format)
	if (text.trim().startsWith("{")) {
		const body: AlcyJsonResponse = JSON.parse(text);
		const dataList = Array.isArray(body.data) ? body.data : [body.data];
		return dataList.map((item) => item.link).filter(Boolean);
	}

	// Text format: one URL per line (PicFlow)
	return text.split("\n").map((l) => l.trim()).filter(Boolean);
}

/**
 * Fetch from t.alcy.cc directly (built-in proxy).
 * Uses the same API format as the alcy-api client.
 */
async function fetchFromTAlcyCc(
	category: string,
	count: number = 4,
): Promise<string[]> {
	const params = new URLSearchParams();
	params.set(category, String(count));
	const url = `${T_ALCY_CC}?${params.toString()}`;
	return fetchFromUrl(url);
}

/**
 * Fetch image URLs with multi-source fallback.
 *
 * Priority order:
 *   1. config.url (primary source, any format)
 *   2. config.fallbackUrl (JSON format, e.g. alcy-api)
 *   3. Built-in t.alcy.cc direct proxy (if builtinProxy is true)
 *
 * Returns an array of image URL strings, or empty array if all sources fail.
 */
export async function fetchImageUrls(
	config: ImageApiConfig,
): Promise<string[]> {
	if (!config.enable) return [];

	const errors: string[] = [];

	// 1. Try primary URL
	if (config.url) {
		try {
			const urls = await fetchFromUrl(config.url);
			if (urls.length > 0) return urls;
		} catch (err) {
			errors.push(`Primary: ${(err as Error).message}`);
		}
	}

	// 2. Try fallback URL
	if (config.fallbackUrl) {
		try {
			const urls = await fetchFromUrl(config.fallbackUrl);
			if (urls.length > 0) {
				console.log(`[image-api] Using fallback source (${urls.length} images)`);
				return urls;
			}
		} catch (err) {
			errors.push(`Fallback: ${(err as Error).message}`);
		}
	}

	// 3. Built-in t.alcy.cc direct proxy
	if (config.builtinProxy !== false) {
		try {
			const category = config.builtinCategory || config.fallbackCategory || "pc";
			const count = config.builtinCount || 4;
			const urls = await fetchFromTAlcyCc(category, count);
			if (urls.length > 0) {
				console.log(
					`[image-api] Using built-in t.alcy.cc proxy (${urls.length} images, category=${category})`,
				);
				return urls;
			}
		} catch (err) {
			errors.push(`Built-in t.alcy.cc: ${(err as Error).message}`);
		}
	}

	if (errors.length > 0) {
		console.warn("[image-api] All sources failed:", errors.join(" | "));
	}

	return [];
}
