import { App, Octokit } from "@octokit";
import { OctokitOptions } from "@octokit/core/types";
import { createOAuthUserAuth } from "@octokit/auth-oauth-user";
import { createAppAuth } from "@octokit/auth-app";
import { createTokenAuth } from "@octokit/auth-token";
import {
  EaCSourceConnectionDetails,
  isEaCSourceConnectionDetails,
} from "../../../eac/modules/sources/EaCSourceConnectionDetails.ts";
import {
  EaCGitHubAppDetails,
  isEaCGitHubAppDetails,
} from "../../../eac/modules/github/EaCGitHubAppDetails.ts";
import {
  loadMainSecretClient,
  loadSecretClient,
} from "../../azure/key-vault.ts";
import {
  EaCGitHubAppAsCode,
  isEaCGitHubAppAsCode,
} from "../../../eac/modules/github/EaCGitHubAppAsCode.ts";
import {
  EverythingAsCodeClouds,
  isEverythingAsCodeClouds,
} from "../../../eac/modules/clouds/EverythingAsCodeClouds.ts";
import { SecretClient } from "npm:@azure/keyvault-secrets";

const EaCOctokit = Octokit; //.plugin(paginateGraphql);

export async function loadOctokit(
  sourceDetails: EaCSourceConnectionDetails,
): Promise<Octokit>;

export async function loadOctokit(
  gitHubAppDetails: EaCGitHubAppDetails,
  sourceDetails?: EaCSourceConnectionDetails,
): Promise<Octokit>;

export async function loadOctokit(
  eac: EverythingAsCodeClouds,
  gitHubApp: EaCGitHubAppAsCode,
): Promise<Octokit>;

export async function loadOctokit(
  eac: EverythingAsCodeClouds,
  gitHubApp: EaCGitHubAppAsCode,
  sourceDetails: EaCSourceConnectionDetails,
): Promise<Octokit>;

export async function loadOctokit(token: string): Promise<Octokit>;

export async function loadOctokit(
  detailsEaCToken:
    | EaCSourceConnectionDetails
    | EaCGitHubAppDetails
    | EverythingAsCodeClouds
    | string,
  sourceDetailsGitHubApp?: EaCSourceConnectionDetails | EaCGitHubAppAsCode,
  sourceDetails?: EaCSourceConnectionDetails,
): Promise<Octokit> {
  const octokitConfig: OctokitOptions = {};

  let secretClientLoader: Promise<SecretClient> | undefined = undefined;

  if (
    isEverythingAsCodeClouds(detailsEaCToken) &&
    isEaCGitHubAppAsCode(sourceDetailsGitHubApp)
  ) {
    const cloudLookup = sourceDetailsGitHubApp.CloudLookup!;

    const keyVaultLookup = sourceDetailsGitHubApp.KeyVaultLookup!;

    secretClientLoader = loadSecretClient(
      detailsEaCToken,
      cloudLookup,
      keyVaultLookup,
    );

    detailsEaCToken = sourceDetailsGitHubApp!.Details as EaCGitHubAppDetails;
  } else if (isEaCGitHubAppDetails(detailsEaCToken)) {
    secretClientLoader = loadMainSecretClient();

    sourceDetails = sourceDetailsGitHubApp as EaCSourceConnectionDetails;
  }

  if (isEaCSourceConnectionDetails(detailsEaCToken)) {
    octokitConfig.authStrategy = createOAuthUserAuth;

    octokitConfig.auth = {
      clientId: Deno.env.get("GITHUB_CLIENT_ID")!,
      clientSecret: Deno.env.get("GITHUB_CLIENT_SECRET")!,
      clientType: "oauth-app",
      token: detailsEaCToken.Token,
    };
  } else if (isEaCGitHubAppDetails(detailsEaCToken)) {
    octokitConfig.authStrategy = createAppAuth;

    let privateKey = detailsEaCToken.PrivateKey;

    if (privateKey.startsWith("$secret:")) {
      const secretClient = await secretClientLoader!;

      const privateKeySecret = await secretClient.getSecret(
        privateKey.replace("$secret:", ""),
      );

      privateKey = privateKeySecret.value!;
    }

    octokitConfig.auth = {
      appId: detailsEaCToken.AppID,
      privateKey: privateKey,
      clientId: detailsEaCToken.ClientID,
      clientSecret: detailsEaCToken.ClientSecret,
    };
  } else if (typeof detailsEaCToken === "string") {
    octokitConfig.auth = detailsEaCToken;
  }

  let octokit = new EaCOctokit(octokitConfig);

  if (sourceDetails) {
    octokit = (await octokit.auth({
      type: "oauth-user",
      token: sourceDetails.Token,
      factory: (options: unknown) => {
        return new Octokit({
          authStrategy: createOAuthUserAuth,
          auth: options,
        });
      },
    })) as Octokit;
  }

  return octokit;
}

export function loadMainOctokit(): Promise<Octokit>;

export function loadMainOctokit(
  sourceDetails: EaCSourceConnectionDetails,
): Promise<Octokit>;

export function loadMainOctokit(
  sourceDetails?: EaCSourceConnectionDetails,
): Promise<Octokit> {
  const appDetails = loadMainGitHubAppDetails();

  console.log(appDetails);

  return loadOctokit(appDetails, sourceDetails);
}

export function loadMainGitHubAppDetails(): EaCGitHubAppDetails {
  return {
    AppID: Deno.env.get("GITHUB_APP_ID")!,
    ClientID: Deno.env.get("GITHUB_CLIENT_ID")!,
    ClientSecret: Deno.env.get("GITHUB_CLIENT_SECRET")!,
    PrivateKey: Deno.env.get("GITHUB_PRIVATE_KEY")!,
    WebhooksSecret: Deno.env.get("GITHUB_WEBHOOKS_SECRET")!,
  };
}
