// deno-lint-ignore-file no-explicit-any
import { HandlerContext, Handlers, Status } from "$fresh/server.ts";
import { respond } from "@fathym/common";
import { EaCAPIUserState } from "../../../../../src/api/EaCAPIUserState.ts";
import { EaCHandlerRequest } from "../../../../../src/api/models/EaCHandlerRequest.ts";
import { EverythingAsCodeSources } from "../../../../../src/eac/modules/sources/EverythingAsCodeSources.ts";
import { EaCDevOpsActionAsCode } from "../../../../../src/eac/modules/sources/EaCDevOpsActionAsCode.ts";
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
      `Processing EaC commit ${handlerRequest.CommitID} DevOps Action processes for action ${handlerRequest.Lookup}`,
    );

    const eac: EverythingAsCodeSources = handlerRequest.EaC;

    const currentDOAs = eac.SourceConnections || {};

    const doaLookup = handlerRequest.Lookup;

    const current = currentDOAs[doaLookup] || {};

    const doa = handlerRequest.Model as EaCDevOpsActionAsCode;

    return respond({
      Checks: [],
      Lookup: doaLookup,
      Messages: {
        Message: `The DevOps Action '${doaLookup}' has been handled.`,
      },
      Model: doa,
    } as EaCHandlerResponse);
  },
};
