export type ReadingStats = {
	characters: number;
	words: number;
	minutes: number;
};

const CJK_CHARACTER =
	/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu;
const WORD = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu;

export function getReadingStats(content: string): ReadingStats {
	const characters = content.match(CJK_CHARACTER)?.length ?? 0;
	const withoutCjk = content.replace(CJK_CHARACTER, " ");
	const words = withoutCjk.match(WORD)?.length ?? 0;
	const duration = characters / 300 + words / 200;

	return {
		characters,
		minutes: duration === 0 ? 0 : Math.max(1, Math.ceil(duration)),
		words,
	};
}
