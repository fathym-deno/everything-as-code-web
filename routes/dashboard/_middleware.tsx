import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { cookieSession } from "$fresh/session";
import { redirectRequest } from "@fathym/common";
import { fathymDenoKv } from "../../configs/deno-kv.config.ts";
import { azureFathymOAuth } from "../../configs/oAuth.config.ts";
import { EverythingAsCodeState } from "../../src/eac/EverythingAsCodeState.ts";
import { loadEaCSvc } from "../../configs/eac.ts";
import {
  UserOAuthConnection,
  userOAuthConnExpired,
} from "../../src/oauth/UserOAuthConnection.ts";
import { EverythingAsCode } from "../../src/eac/EverythingAsCode.ts";

async function loggedInCheck(req: Request, ctx: MiddlewareHandlerContext) {
  const url = new URL(req.url);

  const { pathname, search } = url;

  switch (pathname) {
    default: {
      const sessionId = await azureFathymOAuth.getSessionId(req);

      const successUrl = encodeURI(pathname + search);

      const notSignedInRedirect = `/signin?success_url=${successUrl}`;

      if (sessionId) {
        const currentUsername = await fathymDenoKv.get<UserOAuthConnection>([
          "User",
          sessionId,
          "Current",
          "Username",
        ]);

        if (!userOAuthConnExpired(currentUsername.value)) {
          ctx.state.Username = currentUsername.value!.Username;
        } else {
          return redirectRequest(notSignedInRedirect, false, false);
        }
      } else {
        return redirectRequest(notSignedInRedirect, false, false);
      }

      return ctx.next();
    }
  }
}

async function currentEaC(
  req: Request,
  ctx: MiddlewareHandlerContext<EverythingAsCodeState>,
) {
  const currentEaC = await fathymDenoKv.get<string>([
    "User",
    ctx.state.Username!,
    "Current",
    "EaC",
  ]);

  let eac: EverythingAsCode | undefined = undefined;

  if (currentEaC.value) {
    const eacSvc = await loadEaCSvc(currentEaC.value, ctx.state.Username!);

    eac = await eacSvc.Get(currentEaC.value);
  } else {
    const eacSvc = await loadEaCSvc("", ctx.state.Username!);

    const eacs = await eacSvc.ListForUser();

    if (eacs[0]) {
      await fathymDenoKv.set(
        ["User", ctx.state.Username!, "Current", "EaC"],
        eacs[0].EnterpriseLookup,
      );

      eac = await eacSvc.Get(eacs[0].EnterpriseLookup);
    }
  }

  const state: EverythingAsCodeState = {
    ...ctx.state,
    EaC: eac,
  };

  ctx.state = state;

  return await ctx.next();
}

async function currentState(
  req: Request,
  ctx: MiddlewareHandlerContext<EverythingAsCodeState>,
) {
  const state: EverythingAsCodeState = {
    ...ctx.state,
  };

  if (ctx.state.EaC) {
    const clouds = Object.keys(ctx.state.EaC.Clouds || {});

    if (clouds.length > 0) {
      state.CloudLookup = clouds[0];

      const resGroups =
        ctx.state.EaC.Clouds![state.CloudLookup].ResourceGroups || {};

      const resGroupLookups = Object.keys(resGroups);

      if (resGroupLookups.length > 0) {
        state.ResourceGroupLookup = resGroupLookups[0];
      }
    }
  }

  const currentConn = await fathymDenoKv.get<UserOAuthConnection>([
    "User",
    ctx.state.Username!,
    "Current",
    "GitHub",
    "GitHubConnection",
  ]);

  if (!userOAuthConnExpired(currentConn.value)) {
    state.GitHub = {
      Username: currentConn.value!.Username,
    };
  }

  ctx.state = state;

  return await ctx.next();
}

const session = cookieSession();

function userSession(
  req: Request,
  ctx: MiddlewareHandlerContext<EverythingAsCodeState>,
) {
  return session(req, ctx);
}

export const handler = [loggedInCheck, currentEaC, currentState, userSession];
