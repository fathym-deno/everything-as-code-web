// deno-lint-ignore-file no-explicit-any
import { HandlerContext, Handlers, Status } from "$fresh/server.ts";
import { respond } from "@fathym/common";
import { EaCAPIUserState } from "../../../../../src/api/EaCAPIUserState.ts";
import { EaCHandlerRequest } from "../../../../../src/api/models/EaCHandlerRequest.ts";
import { EverythingAsCodeSources } from "../../../../../src/eac/modules/sources/EverythingAsCodeSources.ts";
import { EaCSourceConnectionAsCode } from "../../../../../src/eac/modules/sources/EaCSourceConnectionAsCode.ts";
import { EaCHandlerResponse } from "../../../../../src/api/models/EaCHandlerResponse.ts";

export const handler: Handlers = {
  /**
   * Use this endpoint to commit update changes to an EaC Environments container.
   * @param req
   * @param _ctx
   * @returns
   */
  async POST(req, _ctx: HandlerContext<any, EaCAPIUserState>) {
    const handlerRequest: EaCHandlerRequest = await req.json();

    console.log(
      `Processing EaC commit ${handlerRequest.CommitID} Source Connection processes for source connection ${handlerRequest.Lookup}`,
    );

    const eac: EverythingAsCodeSources = handlerRequest.EaC;

    const currentSrcConns = eac.SourceConnections || {};

    const srcConnLookup = handlerRequest.Lookup;

    const current = currentSrcConns[srcConnLookup] || {};

    const srcConn = handlerRequest.Model as EaCSourceConnectionAsCode;

    return respond({
      Checks: [],
      Lookup: srcConnLookup,
      Messages: {
        Message: `The source connection '${srcConnLookup}' has been handled.`,
      },
      Model: srcConn,
    } as EaCHandlerResponse);
  },
};
