import { EaCCloudDetails } from "./EaCCloudDetails.ts";

export type EaCCloudAzureDetails = {
  ApplicationID: string;

  AuthKey: string;

  ID?: string;

  SubscriptionID: string;

  TenantID: string;
} & EaCCloudDetails;

export function isEaCCloudAzureDetails(
  details: unknown,
): details is EaCCloudAzureDetails {
  const cloudDetails = details as EaCCloudAzureDetails;

  return (
    cloudDetails &&
    cloudDetails.ApplicationID !== undefined &&
    typeof cloudDetails.ApplicationID === "string" &&
    cloudDetails.AuthKey !== undefined &&
    typeof cloudDetails.AuthKey === "string" &&
    cloudDetails.SubscriptionID !== undefined &&
    typeof cloudDetails.SubscriptionID === "string" &&
    cloudDetails.TenantID !== undefined &&
    typeof cloudDetails.TenantID === "string"
  );
}
