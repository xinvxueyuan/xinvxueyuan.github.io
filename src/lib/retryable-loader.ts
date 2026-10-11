export function createRetryableLoader<T>(importer: () => Promise<T>): () => Promise<T> {
  let loaded: T | undefined;
  let pending: Promise<T> | undefined;

  return () => {
    if (loaded !== undefined) return Promise.resolve(loaded);
    pending ??= importer()
      .then((value) => {
        loaded = value;
        return value;
      })
      .catch((error: unknown) => {
        pending = undefined;
        throw error;
      });
    return pending;
  };
}
