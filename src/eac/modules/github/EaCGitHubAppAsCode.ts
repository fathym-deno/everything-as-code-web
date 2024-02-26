import { EaCDetails } from "../../EaCDetails.ts";
import {
  EaCGitHubAppDetails,
  isEaCGitHubAppDetails,
} from "./EaCGitHubAppDetails.ts";

export type EaCGitHubAppAsCode = {
  CloudLookup?: string;

  KeyVaultLookup?: string;
} & EaCDetails<EaCGitHubAppDetails>;

export function isEaCGitHubAppAsCode(
  app: unknown,
): app is EaCGitHubAppAsCode {
  const gitHubApp = app as EaCGitHubAppAsCode;

  return (
    gitHubApp.CloudLookup !== undefined &&
    typeof gitHubApp.CloudLookup === "string" &&
    gitHubApp.Details !== undefined &&
    isEaCGitHubAppDetails(gitHubApp.Details) &&
    gitHubApp.KeyVaultLookup !== undefined &&
    typeof gitHubApp.KeyVaultLookup === "string"
  );
}
