import { EaCMetadataBase } from "../../EaCMetadataBase.ts";
import { EaCGitHubAppAsCode } from "./EaCGitHubAppAsCode.ts";

export type EverythingAsCodeGitHub = {
  GitHubApps?: Record<string, EaCGitHubAppAsCode>;
} & EaCMetadataBase;

export function isEverythingAsCodeGitHub(
  eac: unknown,
): eac is EverythingAsCodeGitHub {
  const gitHubEaC = eac as EverythingAsCodeGitHub;

  return gitHubEaC.GitHubApps !== undefined;
}
