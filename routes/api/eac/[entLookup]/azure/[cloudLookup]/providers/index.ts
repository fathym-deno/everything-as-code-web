// deno-lint-ignore-file no-explicit-any
import { HandlerContext, Handlers } from "$fresh/server.ts";
import { respond } from "@fathym/common";
import { Provider, ResourceManagementClient } from "npm:@azure/arm-resources";
import { EaCAPIUserState } from "../../../../../../../src/api/EaCAPIUserState.ts";
import { EaCServiceDefinitions } from "../../../../../../../src/api/models/EaCServiceDefinitions.ts";
import { denoKv } from "../../../../../../../configs/deno-kv.config.ts";
import { EverythingAsCodeClouds } from "../../../../../../../src/eac/modules/clouds/EverythingAsCodeClouds.ts";
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

    console.log(
      `Ensuring providers are registered to cloud ${cloudLookup} for enterprise ${entLookup}`,
    );

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

      const svcDevLookups = [...new Set(Object.keys(svcDefs))];

      const svcDefProviderCalls = svcDevLookups.map(
        async (sd) => {
          const provider = await resClient.providers.register(sd);

          console.log(
            `Registered provider ${sd} to cloud ${cloudLookup} for enterprise ${entLookup}`,
          );

          return provider;
        },
      );

      await Promise.all<Provider>(svcDefProviderCalls);
    }

    console.log(
      `Providers are registered to cloud ${cloudLookup} for enterprise ${entLookup}`,
    );

    return respond({
      Locations: locations,
    });
  },
};
