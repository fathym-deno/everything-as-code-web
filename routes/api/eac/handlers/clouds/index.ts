// deno-lint-ignore-file no-explicit-any
import { HandlerContext, Handlers } from "$fresh/server.ts";
import { respond } from "@fathym/common";
import { EaCAPIUserState } from "../../../../../src/api/EaCAPIUserState.ts";
import { EaCHandlerRequest } from "../../../../../src/api/models/EaCHandlerRequest.ts";
import { EverythingAsCodeClouds } from "../../../../../src/eac/modules/clouds/EverythingAsCodeClouds.ts";
import { EaCCloudAsCode } from "../../../../../src/eac/modules/clouds/EaCCloudAsCode.ts";
import {
  beginEaCDeployments,
  buildCloudDeployments,
  finalizeCloudDetails,
} from "./helpers.ts";
import { EaCHandlerCheckRequest } from "../../../../../src/api/models/EaCHandlerCheckRequest.ts";
import { EaCHandlerResponse } from "../../../../../src/api/models/EaCHandlerResponse.ts";
import { EaCHandlerErrorResponse } from "../../../../../src/api/models/EaCHandlerErrorResponse.ts";
import { eacSetSecrets } from "../../../../../src/utils/eac/helpers.ts";
import { loadMainSecretClient } from "../../../../../src/services/azure/key-vault.ts";
import {
  EaCCloudAzureDetails,
  isEaCCloudAzureDetails,
} from "../../../../../src/eac/modules/clouds/EaCCloudAzureDetails.ts";

export const handler: Handlers = {
  /**
   * Use this endpoint to commit update changes to an EaC Environments container.
   * @param req
   * @param _ctx
   * @returns
   */
  async POST(req, _ctx: HandlerContext<any, EaCAPIUserState>) {
    try {
      // const username = ctx.state.Username;

      const handlerRequest: EaCHandlerRequest = await req.json();

      console.log(
        `Processing EaC commit ${handlerRequest.CommitID} Cloud processes for cloud ${handlerRequest.Lookup}`,
      );

      const eac = handlerRequest.EaC as EverythingAsCodeClouds;

      const currentClouds = eac.Clouds || {};

      const cloudLookup = handlerRequest.Lookup;

      const current = currentClouds[cloudLookup] || {};

      const cloud = handlerRequest.Model as EaCCloudAsCode;

      await finalizeCloudDetails(handlerRequest.CommitID, cloud);

      const deployments = await buildCloudDeployments(
        handlerRequest.CommitID,
        eac,
        cloudLookup,
        cloud,
      );

      const checks: EaCHandlerCheckRequest[] = await beginEaCDeployments(
        handlerRequest.CommitID,
        current,
        deployments,
      );

      const secretClient = await loadMainSecretClient();

      const secretRoot = `cloud-${cloudLookup}`;

      const cloudDetails = cloud.Details;

      if (
        isEaCCloudAzureDetails(cloudDetails) &&
        !cloudDetails.AuthKey.startsWith("$secret:")
      ) {
        const secreted = await eacSetSecrets(secretClient, secretRoot, {
          AuthKey: cloudDetails.AuthKey,
        });

        cloud.Details = {
          ...cloud.Details,
          ...secreted,
        } as EaCCloudAzureDetails;
      }

      return respond({
        Checks: checks,
        Lookup: cloudLookup,
        Messages: {
          Message: `The cloud '${cloudLookup}' has been handled.`,
        },
        Model: cloud,
      } as EaCHandlerResponse);
    } catch (err) {
      console.error(err);

      return respond({
        HasError: true,
        Messages: {
          Error: JSON.stringify(err),
        },
      } as EaCHandlerErrorResponse);
    }
  },
};
