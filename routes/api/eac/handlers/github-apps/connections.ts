// deno-lint-ignore-file no-explicit-any
import { HandlerContext, Handlers } from "$fresh/server.ts";
import { respond } from "@fathym/common";
import { EaCAPIUserState } from "../../../../../src/api/EaCAPIUserState.ts";
import { EaCHandlerConnectionsRequest } from "../../../../../src/api/models/EaCHandlerConnectionsRequest.ts";
import { EverythingAsCodeGitHub } from "../../../../../src/eac/modules/github/EverythingAsCodeGitHub.ts";
import { EaCGitHubAppAsCode } from "../../../../../src/eac/modules/github/EaCGitHubAppAsCode.ts";
import { EaCHandlerConnectionsResponse } from "../../../../../src/api/models/EaCHandlerConnectionsResponse.ts";

export const handler: Handlers = {
  /**
   * Use this endpoint to retrieve locations for the provided services.
   * @param _req
   * @param ctx
   * @returns
   */
  async POST(req: Request, ctx: HandlerContext<any, EaCAPIUserState>) {
    const handlerRequest: EaCHandlerConnectionsRequest = await req.json();

    const eac: EverythingAsCodeGitHub = handlerRequest.EaC;

    const sourceDef = handlerRequest.Model as EaCGitHubAppAsCode;

    return respond({
      Model: {} as EaCGitHubAppAsCode,
    } as EaCHandlerConnectionsResponse);
  },
};
