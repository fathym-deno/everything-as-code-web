// deno-lint-ignore-file no-explicit-any
import { HandlerContext, Handlers } from "$fresh/server.ts";
import { respond } from "@fathym/common";
import { EaCAPIUserState } from "../../../../../src/api/EaCAPIUserState.ts";
import { EverythingAsCode } from "../../../../../src/eac/EverythingAsCode.ts";
import { denoKv } from "../../../../../configs/deno-kv.config.ts";
import { EaCMetadataBase } from "../../../../../src/eac/EaCMetadataBase.ts";
import { EaCHandler } from "../../../../../src/eac/EaCHandler.ts";
import { callEaCHandlerConnections } from "../../../../../src/utils/eac/helpers.ts";
import { loadConnections } from "../../../../../src/utils/eac/loadConnections.ts";

export const handler: Handlers = {
  /**
   * Use this endpoint to retrieve locations for the provided services.
   * @param _req
   * @param ctx
   * @returns
   */
  async POST(req: Request, ctx: HandlerContext<any, EaCAPIUserState>) {
    const entLookup = ctx.state.UserEaC!.EnterpriseLookup;

    const eacDef: EverythingAsCode = await req.json();

    const eac = await denoKv.get<EverythingAsCode>(["EaC", entLookup]);

    const eacConnections = {} as EverythingAsCode;

    const eacDefKeys = Object.keys(eacDef || {});

    const connectionCalls = eacDefKeys.map(async (key) => {
      const def = (eacDef[key]! || {}) as Record<string, EaCMetadataBase>;

      let lookups = Object.keys(def);

      const current = (eac.value![key]! || {}) as Record<
        string,
        EaCMetadataBase
      >;

      if (lookups.length === 0) {
        lookups = Object.keys(current);
      }

      const handler = eac.value!.Handlers![key];

      if (handler) {
        eacConnections[key] = await loadConnections(
          eac.value!,
          handler,
          ctx.state.JWT!,
          def,
          current,
          lookups,
        );
      }
    });

    await Promise.all(connectionCalls);

    return respond(eacConnections);
  },
};
