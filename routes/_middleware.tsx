import { FreshContext } from "$fresh/server.ts";
import { loadJwtConfig, UserOAuthConnection } from "@fathym/eac";
import { fathymDenoKv } from "../configs/deno-kv.config.ts";
import { redirectRequest } from "@fathym/common";
import { azureFathymOAuth } from "../configs/oAuth.config.ts";

async function loggedInCheck(req: Request, ctx: FreshContext) {
  const url = new URL(req.url);

  const { origin, pathname, search, searchParams } = url;

  if (origin.endsWith("ngrok-free.app")) {
    return redirectRequest(
      `http://localhost:5437${pathname}${search}`,
      false,
      false,
    );
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
