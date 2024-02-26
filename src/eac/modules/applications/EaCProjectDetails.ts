import { EaCVertexDetails } from "../../EaCVertexDetails.ts";

export type EaCProjectDetails = {
  Favicon?: string;

  Priority: number;
} & EaCVertexDetails;

export function isEaCProjectDetails(
  details: unknown,
): details is EaCProjectDetails {
  const projDetails = details as EaCProjectDetails;

  return !!projDetails;
}
