import { EaCVertexDetails } from "../../EaCVertexDetails.ts";

export type EaCApplicationDetails = {} & EaCVertexDetails;

export function isEaCApplicationDetails(
  details: unknown,
): details is EaCApplicationDetails {
  const appDetails = details as EaCApplicationDetails;

  return !!appDetails;
}
