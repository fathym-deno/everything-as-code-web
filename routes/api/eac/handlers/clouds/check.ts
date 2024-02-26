// deno-lint-ignore-file no-explicit-any
import { HandlerContext, Handlers, Status } from "$fresh/server.ts";
import { respond } from "@fathym/common";
import { EaCAPIUserState } from "../../../../../src/api/EaCAPIUserState.ts";
import { EaCHandlerCloudCheckRequest } from "../../../../../src/eac/modules/clouds/models/EaCHandlerCloudCheckRequest.ts";
import { EverythingAsCodeClouds } from "../../../../../src/eac/modules/clouds/EverythingAsCodeClouds.ts";
import { loadDeploymentDetails } from "./helpers.ts";
import { EaCHandlerCheckResponse } from "../../../../../src/api/models/EaCHandlerCheckResponse.ts";

export const handler: Handlers = {
  /**
   * Use this endpoint to commit update changes to an EaC Environments container.
   * @param req
   * @param _ctx
   * @returns
   */
  async POST(req: Request, _ctx: HandlerContext<any, EaCAPIUserState>) {
    // const username = ctx.state.Username;

    const checkRequest: EaCHandlerCloudCheckRequest = await req.json();

    console.log(
      `Processing EaC commit ${checkRequest.CommitID} Cloud checks`,
    );

    try {
      const eac = checkRequest!.EaC as EverythingAsCodeClouds;

      const currentClouds = eac.Clouds || {};

      const cloud = currentClouds[checkRequest.CloudLookup] || {};

      const deployDetails = await loadDeploymentDetails(
        checkRequest.CommitID,
        cloud,
        checkRequest.Name,
        undefined,
        checkRequest.ResourceGroupLookup,
      );

      const completeStati = ["Canceled", "Failed", "Succeeded"];

      const errorStati = ["Canceled", "Failed"];

      return respond({
        Complete: completeStati.some(
          (status) =>
            status === deployDetails.Deployment.properties?.provisioningState,
        ),
        HasError: errorStati.some(
          (status) =>
            status === deployDetails.Deployment.properties?.provisioningState,
        ),
        Messages: deployDetails.Messages,
      } as EaCHandlerCheckResponse);
    } catch (err) {
      console.error(err);

      return respond({
        CorelationID: checkRequest.CorelationID,
        Complete: true,
        HasError: true,
        Messages: {
          [`Deployment: ${checkRequest.Name}`]: JSON.stringify(err),
        },
      } as EaCHandlerCheckResponse);
    }
  },
};
