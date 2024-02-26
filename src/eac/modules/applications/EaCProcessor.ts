export type EaCProcessor = {
  CacheControl?: Record<string, string>;

  ForceCache?: boolean;
};

export function isEaCProcessor(details: unknown): details is EaCProcessor {
  const proc = details as EaCProcessor;

  return !!proc;
}
