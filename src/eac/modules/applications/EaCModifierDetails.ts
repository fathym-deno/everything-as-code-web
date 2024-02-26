import { EaCVertexDetails } from "../../EaCVertexDetails.ts";

export type EaCModifierDetails = {
  Priority: number;
} & EaCVertexDetails;

export function isEaCModifierDetails(
  details: unknown,
): details is EaCModifierDetails {
  const modDetails = details as EaCModifierDetails;

  return (
    modDetails &&
    modDetails.Priority !== undefined &&
    typeof modDetails.Priority === "number"
  );
}
