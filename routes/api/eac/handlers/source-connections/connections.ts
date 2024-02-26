// deno-lint-ignore-file no-explicit-any
import { HandlerContext, Handlers } from "$fresh/server.ts";
import { respond } from "@fathym/common";
import { EaCAPIUserState } from "../../../../../src/api/EaCAPIUserState.ts";
import { EaCHandlerConnectionsRequest } from "../../../../../src/api/models/EaCHandlerConnectionsRequest.ts";
import { EverythingAsCodeSources } from "../../../../../src/eac/modules/sources/EverythingAsCodeSources.ts";
import { EverythingAsCodeClouds } from "../../../../../src/eac/modules/clouds/EverythingAsCodeClouds.ts";
import { EverythingAsCodeGitHub } from "../../../../../src/eac/modules/github/EverythingAsCodeGitHub.ts";
import { EaCSourceConnectionAsCode } from "../../../../../src/eac/modules/sources/EaCSourceConnectionAsCode.ts";
import { loadOctokit } from "../../../../../src/services/github/octokit/load.ts";
import { EaCHandlerConnectionsResponse } from "../../../../../src/api/models/EaCHandlerConnectionsResponse.ts";
import { eacGetSecrets } from "../../../../../src/utils/eac/helpers.ts";
import { loadSecretClient } from "../../../../../src/services/azure/key-vault.ts";
import { EaCGitHubAppDetails } from "../../../../../src/eac/modules/github/EaCGitHubAppDetails.ts";
import {
  Installation,
  SimpleUser,
} from "../../../../../src/services/github/octokit/types.ts";

export const handler: Handlers = {
  /**
   * Use this endpoint to retrieve locations for the provided services.
   * @param _req
   * @param ctx
   * @returns
   */
  async POST(req: Request, ctx: HandlerContext<any, EaCAPIUserState>) {
    const handlerRequest: EaCHandlerConnectionsRequest = await req.json();

    const eac: EverythingAsCodeSources & EverythingAsCodeClouds =
      handlerRequest.EaC;

    const parentEaC: EverythingAsCodeGitHub = handlerRequest.ParentEaC!;

    const sourceConnDef = handlerRequest.Model as EaCSourceConnectionAsCode;

    const sourceConn = handlerRequest.Current as EaCSourceConnectionAsCode;

    const gitHubApp = parentEaC.GitHubApps![sourceConn.GitHubAppLookup!];

    const secretClient = await loadSecretClient(
      parentEaC,
      gitHubApp.CloudLookup!,
      gitHubApp.KeyVaultLookup!,
    );

    const secreted = await eacGetSecrets(secretClient, {
      ClientSecret: gitHubApp.Details?.ClientSecret!,
      PrivateKey: gitHubApp.Details?.PrivateKey!,
      WebhooksSecret: gitHubApp.Details?.WebhooksSecret!,
    });

    const gitHubAppDetails = {
      ...gitHubApp.Details,
      ...secreted,
    } as EaCGitHubAppDetails;

    const organizationLookups = Object.keys(sourceConnDef.Organizations || {});

    const [_type, username] = handlerRequest.Lookup.split("://");

    const organizations: Record<
      string,
      Record<
        string,
        {
          Branches: string[];
        }
      >
    > = {
      // [username]: {},
    };

    const query = `query paginate($cursor: String) {
      viewer {
        organizations(first: 100, after: $cursor) {
          nodes {
            login
          }
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
    }`;

    try {
      const octokit = await loadOctokit(gitHubAppDetails, sourceConn.Details!);

      const installs = await octokit.rest.apps
        .listInstallationsForAuthenticatedUser();

      installs.data.installations.forEach((installation) => {
        const account = installation.account! as SimpleUser;

        organizations[account.login] = {};
      });
    } catch (err) {
      err.toString();
    }

    return respond({
      Model: {
        Organizations: organizations,
      } as EaCSourceConnectionAsCode,
    } as EaCHandlerConnectionsResponse);
  },
};
