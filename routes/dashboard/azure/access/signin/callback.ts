// deno-lint-ignore-file no-explicit-any
import { Handlers } from "$fresh/server.ts";
import { gitHubOAuth } from "../../../../../configs/oAuth.config.ts";
import { fathymDenoKv } from "../../../../../configs/deno-kv.config.ts";
import { UserOAuthConnection } from "../../../../../src/oauth/UserOAuthConnection.ts";
import { EverythingAsCodeState } from "../../../../../src/eac/EverythingAsCodeState.ts";
import { loadJwtConfig } from "../../../../../configs/jwt.config.ts";

export const handler: Handlers<any, EverythingAsCodeState> = {
  async GET(req, ctx) {
    const now = Date.now();

    const { response, tokens } = await gitHubOAuth.handleCallback(
      req,
    );

    const { accessToken, refreshToken, expiresIn } = tokens;

    const expiresAt = now + expiresIn! * 1000;

    const jwtConfig = loadJwtConfig();

    const [header, payload, signature] = await jwtConfig.Decode(accessToken);

    const primaryEmail = (payload as Record<string, string>).emails[0];

    await fathymDenoKv.set(
      ["User", ctx.state.Username!, "Current", "Azure", "AzureConnection"],
      {
        RefreshToken: refreshToken,
        Token: accessToken,
        Username: primaryEmail,
        ExpiresAt: expiresAt,
      } as UserOAuthConnection,
      {
        expireIn: expiresIn! * 1000,
      },
    );

    return response;
  },
};
