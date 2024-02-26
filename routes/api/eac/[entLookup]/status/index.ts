// deno-lint-ignore-file no-explicit-any
import { HandlerContext, Handlers } from "$fresh/server.ts";
import { respond } from "@fathym/common";
import { EaCAPIUserState } from "../../../../../src/api/EaCAPIUserState.ts";
import { EaCStatus } from "../../../../../src/api/models/EaCStatus.ts";
import { denoKv } from "../../../../../configs/deno-kv.config.ts";
import { EaCStatusProcessingTypes } from "../../../../../src/api/models/EaCStatusProcessingTypes.ts";

export const handler: Handlers = {
  /**
   * Use this endpoint to list a user's EaCs they have access to.
   * @param _req
   * @param ctx
   * @returns
   */
  async GET(req: Request, ctx: HandlerContext<any, EaCAPIUserState>) {
    const entLookup = ctx.state.UserEaC!.EnterpriseLookup;

    const statiResults = await denoKv.list<EaCStatus>({
      prefix: ["EaC", "Status", entLookup, "ID"],
    });

    const stati: EaCStatus[] = [];

    const url = new URL(req.url);

    const statusTypes = url.searchParams
      .getAll("statusType")
      ?.map((st) => Number.parseInt(st) as EaCStatusProcessingTypes);

    for await (const status of statiResults) {
      if (
        !statusTypes ||
        statusTypes.length === 0 ||
        statusTypes.some((st) => st === status.value!.Processing)
      ) {
        stati.push(status.value!);
      }
    }

    const take = Number.parseInt(
      url.searchParams.get("take") || stati.length.toString(),
    );

    const orderedStati = stati
      .sort(
        (a, b) =>
          new Date(b.StartTime).getTime() - new Date(a.StartTime).getTime(),
      )
      .slice(0, take);

    return respond(orderedStati);
  },
};
