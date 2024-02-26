import { Handlers } from "$fresh/server.ts";
import { OAuthHelpers } from "@fathym/common";

export function establishSigninRoute(oAuthHandlers: OAuthHelpers) {
  const handler: Handlers = {
    async GET(req, _ctx) {
      return await oAuthHandlers.signIn(req);
    },
  };

  return { handler, component: undefined };
}
