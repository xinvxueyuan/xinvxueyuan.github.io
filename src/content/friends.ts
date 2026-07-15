import type { Friend } from "../lib/showcase/types";

const friendsData = [] as const satisfies readonly Friend[];

export const friends: readonly Friend[] = friendsData;
