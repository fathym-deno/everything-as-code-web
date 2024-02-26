import {
  EaCDatabaseDetails,
  isEaCDatabaseDetails,
} from "./EaCDatabaseDetails.ts";

export type EaCDenoKVDatabaseDetails = {
  DenoKVPath?: string;

  Type: "DenoKV";
} & EaCDatabaseDetails;

export function isEaCDenoKVDatabaseDetails(
  details: unknown,
): details is EaCDenoKVDatabaseDetails {
  const kvDetails = details as EaCDenoKVDatabaseDetails;

  return (
    isEaCDatabaseDetails(kvDetails) &&
    kvDetails.Type !== undefined &&
    kvDetails.Type === "DenoKV"
  );
}
