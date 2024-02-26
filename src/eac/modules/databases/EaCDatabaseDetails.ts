import { EaCVertexDetails } from "../../EaCVertexDetails.ts";

export type EaCDatabaseDetails = {} & EaCVertexDetails;

export function isEaCDatabaseDetails(
  details: unknown,
): details is EaCDatabaseDetails {
  const dbDetails = details as EaCDatabaseDetails;

  return !!dbDetails;
}
