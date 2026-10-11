export type VisibilityChange = {
  id: string;
  isIntersecting: boolean;
};

export function updateVisibleHeadingIds(
  visible: Set<string>,
  changes: VisibilityChange[],
): void {
  for (const change of changes) {
    if (change.isIntersecting) visible.add(change.id);
    else visible.delete(change.id);
  }
}
