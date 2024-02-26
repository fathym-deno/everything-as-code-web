import {
  EaCProviderDetails,
  isEaCProviderDetails,
} from "./EaCProviderDetails.ts";

export type EaCAzureADB2CProviderDetails = {
  Domain: string;

  PolicyName: string;

  TenantID: string;
} & EaCProviderDetails;

export function isEaCAzureADB2CProviderDetails(
  details: unknown,
): details is EaCAzureADB2CProviderDetails {
  const adb2cPrvdrDetails = details as EaCAzureADB2CProviderDetails;

  return (
    isEaCProviderDetails(adb2cPrvdrDetails) &&
    adb2cPrvdrDetails.Domain !== undefined &&
    typeof adb2cPrvdrDetails.Domain === "string" &&
    adb2cPrvdrDetails.PolicyName !== undefined &&
    typeof adb2cPrvdrDetails.PolicyName === "string" &&
    adb2cPrvdrDetails.TenantID !== undefined &&
    typeof adb2cPrvdrDetails.TenantID === "string"
  );
}
