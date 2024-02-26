import {
  EaCModifierDetails,
  isEaCModifierDetails,
} from "./EaCModifierDetails.ts";

export type EaCDenoKVCacheModifierDetails = {
  CacheSeconds: number;

  DenoKVDatabaseLookup: string;

  PathFilterRegex?: string;
} & EaCModifierDetails;

export function isEaCDenoKVCacheModifierDetails(
  details: unknown,
): details is EaCDenoKVCacheModifierDetails {
  const kvDetails = details as EaCDenoKVCacheModifierDetails;

  return (
    isEaCModifierDetails(kvDetails) &&
    kvDetails.CacheSeconds !== undefined &&
    typeof kvDetails.CacheSeconds === "number" &&
    kvDetails.DenoKVDatabaseLookup !== undefined &&
    typeof kvDetails.DenoKVDatabaseLookup === "string"
  );
}
