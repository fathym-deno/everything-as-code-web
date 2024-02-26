import { Handlers, PageProps } from "$fresh/server.ts";
import { EaCManageCloudForm } from "@fathym/atomic";
import { redirectRequest } from "@fathym/common";
import { EaCCloudAzureDetails } from "@fathym/eac";
import {
  EaCStatusProcessingTypes,
  FathymEaC,
  loadEaCSvc,
  waitForStatus,
} from "@fathym/eac/api";
import { EverythingAsCodeState } from "../../../../src/eac/EverythingAsCodeState.ts";

type AzurePageData = {};

export const handler: Handlers<AzurePageData, EverythingAsCodeState> = {
  async GET(_req, ctx) {
    const data: AzurePageData = {};

    return ctx.render(data);
  },

  async POST(req, ctx) {
    const formData = await req.formData();

    const cloudLookup = (formData.get("cloudLookup") as string) ||
      crypto.randomUUID();

    const eac: FathymEaC = {
      EnterpriseLookup: ctx.state.EaC!.EnterpriseLookup,
      Clouds: {
        [cloudLookup]: {
          Details: {
            Name: formData.get("name") as string,
            Description: formData.get("description") as string,
            ApplicationID: formData.get("application-id") as string,
            AuthKey: formData.get("auth-key") as string,
            SubscriptionID: formData.get("subscription-id") as string,
            TenantID: formData.get("tenant-id") as string,
            Type: "Azure",
          } as EaCCloudAzureDetails,
        },
      },
    };

    const eacSvc = await loadEaCSvc(eac.EnterpriseLookup!, ctx.state.Username!);

    const commitResp = await eacSvc.Commit(eac, 60);

    const status = await waitForStatus(
      eacSvc,
      commitResp.EnterpriseLookup,
      commitResp.CommitID,
    );

    if (status.Processing == EaCStatusProcessingTypes.COMPLETE) {
      return redirectRequest("/dashboard", false, false);
    } else {
      return redirectRequest(
        `/dashboard?error=${
          encodeURIComponent(
            status.Messages["Error"] as string,
          )
        }&commitId=${commitResp.CommitID}`,
        false,
        false,
      );
    }
  },
};

export default function Azure({
  data,
}: PageProps<AzurePageData, EverythingAsCodeState>) {
  return <EaCManageCloudForm action="" />;
}
