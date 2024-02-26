import { EaCVertexDetails } from "../../EaCVertexDetails.ts";

export type EaCSourceConnectionDetails = {
  ExpiresAt: number;

  RefreshToken: string;

  Token: string;
} & EaCVertexDetails;

export function isEaCSourceConnectionDetails(
  details: unknown,
): details is EaCSourceConnectionDetails {
  const gitHubAppDetails = details as EaCSourceConnectionDetails;

  return (
    gitHubAppDetails.Token !== undefined &&
    typeof gitHubAppDetails.Token === "string"
  );
}
