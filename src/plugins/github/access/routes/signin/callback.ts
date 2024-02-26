// deno-lint-ignore-file no-explicit-any
import { FreshContext, Handlers } from "$fresh/server.ts";
import { loadMainOctokit } from "../../../../../services/github/octokit/load.ts";
import { EaCSourceConnectionDetails } from "../../../../../eac/modules/sources/EaCSourceConnectionDetails.ts";
import { UserOAuthConnection } from "../../../../../oauth/UserOAuthConnection.ts";
import { EverythingAsCodeState } from "../../../../../eac/EverythingAsCodeState.ts";
import { waitForStatus } from "../../../../../utils/eac/waitForStatus.ts";
import { OAuthHelpers } from "@fathym/common";
import { EaCServiceClient } from "../../../../../eac/client/EaCServiceClient.ts";
import { EverythingAsCode } from "../../../../../eac/EverythingAsCode.ts";
import { EverythingAsCodeSources } from "../../../../../eac/modules/sources/EverythingAsCodeSources.ts";
import { GitHubAccessPluginState } from "../../GitHubAccessPluginState.ts";

export function establishSigninCallbackRoute<
  TState extends GitHubAccessPluginState,
>(
  oAuthHandlers: OAuthHelpers,
  denoKv: Deno.Kv,
  loadEaCSvc: (ctx: FreshContext<TState>) => Promise<EaCServiceClient>,
) {
  const handler: Handlers<any, TState> = {
    async GET(req, ctx) {
      const now = Date.now();

      const oldSessionId = await oAuthHandlers.getSessionId(req);

      const { response, tokens, sessionId } = await oAuthHandlers
        .handleCallback(req);

      const { accessToken, refreshToken, expiresIn } = tokens;

      const expiresAt = now + expiresIn! * 1000;

      const octokit = await loadMainOctokit({
        Token: accessToken,
      } as EaCSourceConnectionDetails);

      const {
        data: { login },
      } = await octokit.rest.users.getAuthenticated();

      if (oldSessionId) {
        const curUser = await denoKv.get([
          "User",
          oldSessionId!,
          "Current",
          "Username",
        ]);

        if (curUser.value) {
          await denoKv.set(
            ["User", sessionId, "Current", "Username"],
            {
              ...curUser.value,
            } as UserOAuthConnection,
            {
              expireIn: expiresIn! * 1000,
            },
          );

          await denoKv.delete(["User", oldSessionId!, "Current", "Username"]);
        }
      }

      await denoKv.set(
        ["User", ctx.state.Username!, "Current", "GitHub", "GitHubConnection"],
        {
          RefreshToken: refreshToken,
          Token: accessToken,
          Username: login,
          ExpiresAt: expiresAt,
        } as UserOAuthConnection,
        {
          expireIn: expiresIn! * 1000,
        },
      );

      const srcConnLookup = `GITHUB://${login}`;

      let srcConnDetails: EaCSourceConnectionDetails;

      if (
        ctx.state.EaC?.SourceConnections &&
        ctx.state.EaC.SourceConnections[srcConnLookup]
      ) {
        srcConnDetails = ctx.state.EaC.SourceConnections[srcConnLookup]!
          .Details!;
      } else {
        srcConnDetails = {
          Name: `${login} GitHub Connection`,
          Description: `The GitHub connection to use for user ${login}.`,
        } as EaCSourceConnectionDetails;
      }

      srcConnDetails.ExpiresAt = expiresAt;

      srcConnDetails.RefreshToken = refreshToken!;

      srcConnDetails.Token = accessToken;

      const eacSvc = await loadEaCSvc(ctx);

      const commitResp = await eacSvc.Commit(
        {
          EnterpriseLookup: ctx.state.EaC!.EnterpriseLookup!,
          SourceConnections: {
            [srcConnLookup]: {
              Details: srcConnDetails,
              GitHubAppLookup: Deno.env.get("GITHUB_APP_ID"),
            },
          },
        },
        60,
      );

      await waitForStatus(
        eacSvc,
        commitResp.EnterpriseLookup,
        commitResp.CommitID,
      );

      return response;
    },
  };

  return { handler, component: undefined };
}
