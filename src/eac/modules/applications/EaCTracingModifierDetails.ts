import {
  EaCModifierDetails,
  isEaCModifierDetails,
} from "./EaCModifierDetails.ts";

export type EaCTracingModifierDetails = {
  TraceRequest: boolean;

  TraceResponse: boolean;
} & EaCModifierDetails;

export function isEaCTracingModifierDetails(
  details: unknown,
): details is EaCTracingModifierDetails {
  const kvDetails = details as EaCTracingModifierDetails;

  return (
    isEaCModifierDetails(kvDetails) &&
    kvDetails.TraceRequest !== undefined &&
    typeof kvDetails.TraceRequest === "boolean" &&
    kvDetails.TraceResponse !== undefined &&
    typeof kvDetails.TraceResponse === "boolean"
  );
}
