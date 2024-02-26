import {
  EaCProviderDetails,
  isEaCProviderDetails,
} from "./EaCProviderDetails.ts";

export type EaCOAuthProviderDetails = {
  AuthorizationEndpointURI: string;

  TokenURI: string;
} & EaCProviderDetails;

export function isEaCOAuthProviderDetails(
  details: unknown,
): details is EaCOAuthProviderDetails {
  const oauthPrvdrDetails = details as EaCOAuthProviderDetails;

  return (
    isEaCProviderDetails(oauthPrvdrDetails) &&
    oauthPrvdrDetails.AuthorizationEndpointURI !== undefined &&
    typeof oauthPrvdrDetails.AuthorizationEndpointURI === "string" &&
    oauthPrvdrDetails.TokenURI !== undefined &&
    typeof oauthPrvdrDetails.TokenURI === "string"
  );
}
