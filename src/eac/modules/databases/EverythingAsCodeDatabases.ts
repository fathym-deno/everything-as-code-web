import { EaCMetadataBase } from "../../EaCMetadataBase.ts";
import { EaCDatabaseAsCode } from "./EaCDatabaseAsCode.ts";

export type EverythingAsCodeDatabases = {
  Databases?: Record<string, EaCDatabaseAsCode>;
} & EaCMetadataBase;

export function isEverythingAsCodeDatabases(
  eac: unknown,
): eac is EverythingAsCodeDatabases {
  const sourcesEaC = eac as EverythingAsCodeDatabases;

  return (
    sourcesEaC.Databases !== undefined
  );
}
