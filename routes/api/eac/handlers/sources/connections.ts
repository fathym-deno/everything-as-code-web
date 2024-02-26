// deno-lint-ignore-file no-explicit-any
import { HandlerContext, Handlers } from "$fresh/server.ts";
import { respond } from "@fathym/common";
import { EaCAPIUserState } from "../../../../../src/api/EaCAPIUserState.ts";
import { EaCHandlerConnectionsRequest } from "../../../../../src/api/models/EaCHandlerConnectionsRequest.ts";
import { EverythingAsCodeSources } from "../../../../../src/eac/modules/sources/EverythingAsCodeSources.ts";
import { EaCSourceAsCode } from "../../../../../src/eac/modules/sources/EaCSourceAsCode.ts";
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

    const eac: EverythingAsCodeSources = handlerRequest.EaC;

    const sourceDef = handlerRequest.Model as EaCSourceAsCode;

    return respond({
      Model: {} as EaCSourceAsCode,
    } as EaCHandlerConnectionsResponse);
  },
};
