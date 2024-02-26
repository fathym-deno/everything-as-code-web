import { EaCProcessor, isEaCProcessor } from './EaCProcessor.ts';

export type EaCPreactAppProcessor = {
  AppRoot: string;
} & EaCProcessor;

export function isEaCPreactAppProcessor(
  details: unknown
): details is EaCPreactAppProcessor {
  const proc = details as EaCPreactAppProcessor;

  return (
    isEaCProcessor(proc) &&
    proc.AppRoot !== undefined &&
    typeof proc.AppRoot === 'string'
  );
}
