import { Handlers } from "$fresh/server.ts";
import { redirectRequest } from "@fathym/common";
import { EverythingAsCodeState } from "../../src/eac/EverythingAsCodeState.ts";

interface JWTPageData {
  jwt?: string;
}

export const handler: Handlers<JWTPageData | null, EverythingAsCodeState> = {
  GET(_, ctx) {
    if (!ctx.state.EaC) {
      return redirectRequest("/dashboard/enterprise");
    } else if (!ctx.state.CloudLookup) {
      return redirectRequest("/dashboard/clouds/azure");
    } else if (!ctx.state.ResourceGroupLookup) {
      return redirectRequest("/dashboard/clouds/calz");
    } else {
      return redirectRequest("/dashboard/jwt");
    }
  },
};
