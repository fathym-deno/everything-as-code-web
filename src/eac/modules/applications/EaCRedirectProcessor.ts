import { EaCProcessor, isEaCProcessor } from "./EaCProcessor.ts";

export type EaCRedirectProcessor = {
  Permanent: boolean;

  PreserveMethod: boolean;

  Redirect: string;
} & EaCProcessor;

export function isEaCRedirectProcessor(
  details: unknown,
): details is EaCRedirectProcessor {
  const proc = details as EaCRedirectProcessor;

  return (
    isEaCProcessor(proc) &&
    proc.Redirect !== undefined &&
    typeof proc.Redirect === "string"
  );
}
