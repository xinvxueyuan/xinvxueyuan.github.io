import type { TimelineEntry } from "../lib/showcase/types";

// No public milestone is published until its date can be verified from a stable source.
const timelineData = [] as const satisfies readonly TimelineEntry[];

export const timeline: readonly TimelineEntry[] = timelineData;
