import { EaCVertexDetails } from "../../EaCVertexDetails.ts";

export type EaCGitHubAppDetails = {
  AppID: string;

  ClientID: string;

  ClientSecret: string;

  PrivateKey: string;

  WebhooksSecret: string;
} & EaCVertexDetails;

export function isEaCGitHubAppDetails(
  details: unknown,
): details is EaCGitHubAppDetails {
  const gitHubAppDetails = details as EaCGitHubAppDetails;

  return (
    gitHubAppDetails.AppID !== undefined &&
    typeof gitHubAppDetails.AppID === "string" &&
    gitHubAppDetails.ClientID !== undefined &&
    typeof gitHubAppDetails.ClientID === "string" &&
    gitHubAppDetails.ClientSecret !== undefined &&
    typeof gitHubAppDetails.ClientSecret === "string" &&
    gitHubAppDetails.PrivateKey !== undefined &&
    typeof gitHubAppDetails.PrivateKey === "string" &&
    gitHubAppDetails.WebhooksSecret !== undefined &&
    typeof gitHubAppDetails.WebhooksSecret === "string"
  );
}
