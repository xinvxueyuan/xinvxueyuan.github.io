import type { DiaryEntry } from "../lib/showcase/types";

const diaryData = [] as const satisfies readonly DiaryEntry[];

export const diary: readonly DiaryEntry[] = diaryData;
