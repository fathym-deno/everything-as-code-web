import { Handlers } from "$fresh/server.ts";
import { OAuthHelpers } from "@fathym/common";

export function establishSignoutRoute(oAuthHandlers: OAuthHelpers) {
  const handler: Handlers = {
    async GET(req, _ctx) {
      return await oAuthHandlers.signOut(req);
    },
  };

  return { handler, component: undefined };
}
