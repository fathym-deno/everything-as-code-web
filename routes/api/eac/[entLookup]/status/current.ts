// deno-lint-ignore-file no-explicit-any
import { HandlerContext, Handlers } from "$fresh/server.ts";
import { respond } from "@fathym/common";
import { EaCAPIUserState } from "../../../../../src/api/EaCAPIUserState.ts";
import { denoKv } from "../../../../../configs/deno-kv.config.ts";
import { EaCStatus } from "../../../../../src/api/models/EaCStatus.ts";
import { EaCStatusProcessingTypes } from "../../../../../src/api/models/EaCStatusProcessingTypes.ts";

export const handler: Handlers = {
  /**
   * Use this endpoint to get the current status of an EaC.
   * @param _req
   * @param ctx
   * @returns
   */
  async GET(_req: Request, ctx: HandlerContext<any, EaCAPIUserState>) {
    const entLookup = ctx.state.UserEaC!.EnterpriseLookup;

    const status = await denoKv.get<EaCStatus>([
      "EaC",
      "Status",
      entLookup,
      "EaC",
    ]);

    const idleStatus: EaCStatus = {
      ID: "",
      Messages: {},
      EnterpriseLookup: entLookup,
      Processing: EaCStatusProcessingTypes.IDLE,
      StartTime: new Date(Date.now()),
      Username: "system",
    };

    return respond(
      status?.value! || idleStatus,
    );
  },
};
