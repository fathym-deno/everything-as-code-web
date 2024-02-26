// deno-lint-ignore-file no-explicit-any
import { HandlerContext, Handlers } from "$fresh/server.ts";
import { merge, respond } from "@fathym/common";
import { ResourceManagementClient } from "npm:@azure/arm-resources";
import { EaCAPIUserState } from "../../../../../../../src/api/EaCAPIUserState.ts";
import { EaCServiceDefinitions } from "../../../../../../../src/api/models/EaCServiceDefinitions.ts";
import { EverythingAsCodeClouds } from "../../../../../../../src/eac/modules/clouds/EverythingAsCodeClouds.ts";
import { denoKv } from "../../../../../../../configs/deno-kv.config.ts";
import { loadAzureCloudCredentials } from "../../../../../../../src/utils/eac/loadAzureCloudCredentials.ts";
import { EaCCloudAzureDetails } from "../../../../../../../src/eac/modules/clouds/EaCCloudAzureDetails.ts";

export const handler: Handlers = {
  /**
   * Use this endpoint to retrieve locations for the provided services.
   * @param _req
   * @param ctx
   * @returns
   */
  async POST(req: Request, ctx: HandlerContext<any, EaCAPIUserState>) {
    const entLookup = ctx.state.UserEaC!.EnterpriseLookup;

    const cloudLookup: string = ctx.params.cloudLookup;

    const svcDefs: EaCServiceDefinitions = await req.json();

    const eacResult = await denoKv.get<EverythingAsCodeClouds>([
      "EaC",
      entLookup,
    ]);

    const eac = eacResult.value!;

    const creds = await loadAzureCloudCredentials(eac, cloudLookup);

    let svcDefApiVersions: Record<string, string> = {};

    if (creds) {
      const details = eac.Clouds![cloudLookup!].Details as EaCCloudAzureDetails;

      const resClient = new ResourceManagementClient(
        creds,
        details.SubscriptionID,
      );

      const svcDefApiVersionCalls = Object.keys(svcDefs).map(async (sd) => {
        const svcDef = svcDefs[sd];

        const provider = await resClient.providers.get(sd);

        const providerTypeApiVersions = provider.resourceTypes
          ?.filter((rt) => {
            return svcDef.Types.includes(rt.resourceType!);
          })
          .map((rt) => {
            return {
              type: rt.resourceType!,
              apiVersion: rt.defaultApiVersion!,
            };
          })!;

        const res = providerTypeApiVersions.reduce((p, c) => {
          p[c.type] = c.apiVersion;

          return p;
        }, {} as Record<string, string>);

        return res;
      });

      const svcDefApiVersionResults = await Promise.all<Record<string, string>>(
        svcDefApiVersionCalls,
      );

      svcDefApiVersions = merge(
        svcDefApiVersions,
        svcDefApiVersionResults.reduce((prev, cur) => {
          const next = cur;

          return merge(prev, next);
        }, {} as Record<string, string>),
      );
    }

    return respond(svcDefApiVersions);
  },
};
