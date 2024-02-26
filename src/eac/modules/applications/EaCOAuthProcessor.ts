import { EaCProcessor, isEaCProcessor } from "./EaCProcessor.ts";

export type EaCOAuthProcessor = {
  ProviderLookup: string;
} & EaCProcessor;

export function isEaCOAuthProcessor(
  details: unknown,
): details is EaCOAuthProcessor {
  const proc = details as EaCOAuthProcessor;

  return (
    isEaCProcessor(proc) &&
    proc.ProviderLookup !== undefined &&
    typeof proc.ProviderLookup === "string"
  );
}
