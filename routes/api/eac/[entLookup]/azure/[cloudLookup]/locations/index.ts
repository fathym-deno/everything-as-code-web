// deno-lint-ignore-file no-explicit-any
import { HandlerContext, Handlers } from "$fresh/server.ts";
import { respond } from "@fathym/common";
import { ResourceManagementClient } from "npm:@azure/arm-resources";
import { Location, SubscriptionClient } from "npm:@azure/arm-subscriptions";
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

    const locations: Location[] = [];

    if (creds) {
      const details = eac.Clouds![cloudLookup!].Details as EaCCloudAzureDetails;

      const resClient = new ResourceManagementClient(
        creds,
        details.SubscriptionID,
      );

      const svcDefLocationCalls = Object.keys(svcDefs).map(async (sd) => {
        const svcDef = svcDefs[sd];

        const provider = await resClient.providers.get(sd);

        const providerTypeLocations = provider.resourceTypes
          ?.filter((rt) => {
            return svcDef.Types.includes(rt.resourceType!);
          })
          .map((rt) => rt.locations!)!;

        return Array.from(new Set(...providerTypeLocations));
      });

      const svcDefLocations = await Promise.all<string[]>(svcDefLocationCalls);

      const locationNames = Array.from(new Set(...svcDefLocations));

      const subClient = new SubscriptionClient(creds);

      const subLocationsList = subClient.subscriptions.listLocations(
        details.SubscriptionID,
      );

      for await (const subLocation of subLocationsList) {
        if (
          locationNames.length === 0 ||
          locationNames.includes(subLocation.displayName!)
        ) {
          locations.push(subLocation);
        }
      }
    }

    return respond({
      Locations: locations,
    });
  },
};
