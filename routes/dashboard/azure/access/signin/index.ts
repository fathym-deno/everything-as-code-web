import { Handlers } from "$fresh/server.ts";
import { azureOAuth } from "../../../../../configs/oAuth.config.ts";

export const handler: Handlers = {
  async GET(req, _ctx) {
    return await azureOAuth.signIn(req);
  },
};
