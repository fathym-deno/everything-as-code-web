import {
  EaCModifierDetails,
  isEaCModifierDetails,
} from "./EaCModifierDetails.ts";

export type EaCOAuthModifierDetails = {
  ProviderLookup: string;

  SignInPath: string;
} & EaCModifierDetails;

export function isEaCOAuthModifierDetails(
  details: unknown,
): details is EaCOAuthModifierDetails {
  const kvDetails = details as EaCOAuthModifierDetails;

  return (
    isEaCModifierDetails(kvDetails) &&
    kvDetails.ProviderLookup !== undefined &&
    typeof kvDetails.ProviderLookup === "string" &&
    kvDetails.SignInPath !== undefined &&
    typeof kvDetails.SignInPath === "string"
  );
}
