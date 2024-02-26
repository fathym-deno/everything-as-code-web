import { EaCVertexDetails } from "../../EaCVertexDetails.ts";

export type EaCCloudDetails = {
  Type: "Azure";
} & EaCVertexDetails;

export function isEaCCloudDetails(
  details: unknown,
): details is EaCCloudDetails {
  const cloudDetails = details as EaCCloudDetails;

  return (
    cloudDetails &&
    cloudDetails.Type !== undefined &&
    cloudDetails.Type === "Azure"
  );
}
