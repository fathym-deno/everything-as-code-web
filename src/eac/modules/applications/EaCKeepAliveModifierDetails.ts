import {
  EaCModifierDetails,
  isEaCModifierDetails,
} from "./EaCModifierDetails.ts";

export type EaCKeepAliveModifierDetails = {
  KeepAlivePath: string;
} & EaCModifierDetails;

export function isEaCKeepAliveModifierDetails(
  details: unknown,
): details is EaCKeepAliveModifierDetails {
  const kvDetails = details as EaCKeepAliveModifierDetails;

  return (
    isEaCModifierDetails(kvDetails) &&
    kvDetails.KeepAlivePath !== undefined &&
    typeof kvDetails.KeepAlivePath === "string"
  );
}
