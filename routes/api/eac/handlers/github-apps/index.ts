// deno-lint-ignore-file no-explicit-any
import { HandlerContext, Handlers, Status } from "$fresh/server.ts";
import { respond } from "@fathym/common";
import { EaCAPIUserState } from "../../../../../src/api/EaCAPIUserState.ts";
import { EaCGitHubAppAsCode } from "../../../../../src/eac/modules/github/EaCGitHubAppAsCode.ts";
import { EaCHandlerRequest } from "../../../../../src/api/models/EaCHandlerRequest.ts";
import { EverythingAsCodeGitHub } from "../../../../../src/eac/modules/github/EverythingAsCodeGitHub.ts";
import { loadSecretClient } from "../../../../../src/services/azure/key-vault.ts";
import { EaCHandlerResponse } from "../../../../../src/api/models/EaCHandlerResponse.ts";
import { eacSetSecrets } from "../../../../../src/utils/eac/helpers.ts";
import { EaCGitHubAppDetails } from "../../../../../src/eac/modules/github/EaCGitHubAppDetails.ts";

export const handler: Handlers = {
  /**
   * Use this endpoint to commit update changes to an EaC Environments container.
   * @param req
   * @param _ctx
   * @returns
   */
  async POST(req, _ctx: HandlerContext<any, EaCAPIUserState>) {
    const handlerRequest: EaCHandlerRequest = await req.json();

    console.log(
      `Processing EaC commit ${handlerRequest.CommitID} GitHub App processes for app ${handlerRequest.Lookup}`,
    );

    const eac: EverythingAsCodeGitHub = handlerRequest.EaC;

    const currentGitHubApps = eac.GitHubApps || {};

    const gitHubAppLookup = handlerRequest.Lookup;

    const current = currentGitHubApps[gitHubAppLookup] || {};

    const gitHubApp = handlerRequest.Model as EaCGitHubAppAsCode;

    const cloudLookup = gitHubApp.CloudLookup || current.CloudLookup!;

    const keyVaultLookup = gitHubApp.KeyVaultLookup || current.KeyVaultLookup!;

    const secretClient = await loadSecretClient(
      eac,
      cloudLookup,
      keyVaultLookup,
    );

    const secretRoot = `github-app-${gitHubAppLookup}`;

    const secreted = await eacSetSecrets(secretClient, secretRoot, {
      ClientSecret: gitHubApp.Details?.ClientSecret,
      PrivateKey: gitHubApp.Details?.PrivateKey,
      WebhooksSecret: gitHubApp.Details?.WebhooksSecret,
    });

    gitHubApp.Details = {
      ...gitHubApp.Details,
      ...secreted,
    } as EaCGitHubAppDetails;

    return respond({
      Checks: [],
      Lookup: gitHubAppLookup,
      Messages: {
        Message: `The GitHubApp '${gitHubAppLookup}' has been handled.`,
      },
      Model: gitHubApp,
    } as EaCHandlerResponse);
  },
};
