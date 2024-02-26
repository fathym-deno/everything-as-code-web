import { getCookies, setCookie } from "$std/http/cookie.ts";
import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { fathymDenoKv } from "../configs/deno-kv.config.ts";
import { redirectRequest } from "@fathym/common";
import { UserOAuthConnection } from "../src/oauth/UserOAuthConnection.ts";
import { azureFathymOAuth } from "../configs/oAuth.config.ts";
import { EaCSourceConnectionDetails } from "../src/eac/modules/sources/EaCSourceConnectionDetails.ts";
import { loadMainOctokit } from "../src/services/github/octokit/load.ts";
import { getCurrentAzureUser } from "./api/eac/handlers/clouds/helpers.ts";
import { loadJwtConfig } from "../configs/jwt.config.ts";

async function loggedInCheck(req: Request, ctx: MiddlewareHandlerContext) {
  const url = new URL(req.url);

  const { origin, pathname, search, searchParams } = url;

  if (origin.endsWith("ngrok-free.app")) {
    return redirectRequest(`http://localhost:5437${pathname}${search}`);
  }

  if (pathname.startsWith("/dashboard")) {
    return ctx.next();
  }

  switch (pathname) {
    case "/signin": {
      const host = req.headers.get("x-forwarded-host") || url.host;

      let proto = req.headers.get("x-forwarded-proto") || url.protocol;

      if (!proto.endsWith(":")) {
        proto += ":";
      }

      const resp = await azureFathymOAuth.signIn(req, {
        urlParams: {
          redirect_uri: `${proto}//${host}/signin/callback`,
        },
      });

      return resp;
    }

    case "/signin/callback": {
      const now = Date.now();

      const oldSessionId = await azureFathymOAuth.getSessionId(req);

      const { response, tokens, sessionId } = await azureFathymOAuth
        .handleCallback(req);

      const { accessToken, refreshToken, expiresIn } = tokens;

      const jwtConfig = loadJwtConfig();

      const [header, payload, signature] = await jwtConfig.Decode(accessToken);

      const primaryEmail = (payload as Record<string, string>).emails[0];

      await fathymDenoKv.set(
        ["User", sessionId, "Current", "Username"],
        {
          Username: primaryEmail!,
          ExpiresAt: now + expiresIn! * 1000,
          Token: accessToken,
          RefreshToken: refreshToken,
        } as UserOAuthConnection,
        {
          expireIn: expiresIn! * 1000,
        },
      );

      if (oldSessionId) {
        await fathymDenoKv.delete([
          "User",
          oldSessionId,
          "Current",
          "Username",
        ]);
      }

      return response;
    }

    case "/signout": {
      return await azureFathymOAuth.signOut(req);
    }

    default: {
      return ctx.next();
    }
  }
}

export const handler = [loggedInCheck];
