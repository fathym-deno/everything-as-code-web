// import { Handlers, PageProps } from "$fresh/server.ts";
// import { CloudConnectExistingForm } from "@fathym/atomic";
// import { Subscription, SubscriptionClient } from "npm:@azure/arm-subscriptions";
// import { AccessToken } from "npm:@azure/identity";
// import { EverythingAsCodeState } from "../../../../src/eac/EverythingAsCodeState.ts";
// import { FathymEaC } from "../../../../src/FathymEaC.ts";
// import { EaCCloudAzureDetails } from "../../../../src/eac/modules/clouds/EaCCloudAzureDetails.ts";
// import { loadEaCSvc } from "../../../../configs/eac.ts";
// import { waitForStatus } from "../../../../src/utils/eac/waitForStatus.ts";
// import { EaCStatusProcessingTypes } from "../../../../src/api/models/EaCStatusProcessingTypes.ts";
// import { redirectRequest } from "@fathym/common";
// // import {
// //   msalAuthProvider,
// //   msalPluginConfig,
// // } from "../../../../configs/msal.config.ts";
// import { AzureAuthCheckDisplay } from "../../../../components/organism/azure/auth-check-display.tsx";
// import { Session } from "$fresh/session";

// interface AzureNewPageData {
//   isAuthenticated: boolean;

//   subs: Subscription[];
// }

// async function listSubscriptions(session: Session): Promise<Subscription[]> {
//   const subs: Subscription[] = [];

//   try {
//     const subClient = new SubscriptionClient({
//       getToken: async () => {
//         const token = await msalPluginConfig.MSALAuthProvider.GetAccessToken(
//           session,
//         );

//         return {
//           token,
//         } as AccessToken;
//       },
//     });

//     const subsList = subClient.subscriptions.list();

//     for await (const sub of subsList) {
//       subs.push(sub);
//     }
//   } catch (err) {
//     console.log(err);
//   }

//   return subs;
// }

// export const handler: Handlers<AzureNewPageData, EverythingAsCodeState> = {
//   async GET(_req, ctx) {
//     const data: AzureNewPageData = {
//       isAuthenticated: ctx.state.session.get("isMsalAuthenticated"),
//       subs: [],
//     };

//     if (data.isAuthenticated) {
//       data.subs = await listSubscriptions(ctx.state.session);
//     }

//     return ctx.render(data);
//   },

//   async POST(req, ctx) {
//     const formData = await req.formData();

//     const cloudLookup = (formData.get("cloudLookup") as string) ||
//       crypto.randomUUID();

//     const subId = formData.get("subscription-id") as string;

//     const subs = await listSubscriptions(ctx.state.session);

//     const currentSub = subs.find((sub) => sub.subscriptionId === subId)!;

//     const name = currentSub.displayName;

//     const tenantId = currentSub.tenantId;

//     const token = await msalPluginConfig.MSALAuthProvider.GetAccessToken(
//       ctx.state.session,
//     );

//     const eac: FathymEaC = {
//       EnterpriseLookup: ctx.state.EaC!.EnterpriseLookup,
//       Clouds: {
//         [cloudLookup]: {
//           Details: {
//             Name: name,
//             Description: `Created using Fathym EaC with Azure APIs: ${name}`,
//             SubscriptionID: subId,
//             TenantID: tenantId,
//             Type: "Azure",
//           } as EaCCloudAzureDetails,
//           Token: token,
//         },
//       },
//     };

//     const eacSvc = await loadEaCSvc(eac.EnterpriseLookup!, ctx.state.Username!);

//     const commitResp = await eacSvc.Commit(eac, 60);

//     const status = await waitForStatus(
//       eacSvc,
//       commitResp.EnterpriseLookup,
//       commitResp.CommitID,
//     );

//     if (status.Processing == EaCStatusProcessingTypes.COMPLETE) {
//       return redirectRequest("/dashboard");
//     } else {
//       return redirectRequest(
//         `/dashboard?error=${
//           encodeURIComponent(
//             status.Messages["Error"] as string,
//           )
//         }&commitId=${commitResp.CommitID}`,
//       );
//     }
//   },
// };

// export default function AzureNew({
//   data,
// }: PageProps<AzureNewPageData, EverythingAsCodeState>) {
//   return (
//     <AzureAuthCheckDisplay isAuthenticated={data.isAuthenticated}>
//       <CloudConnectExistingForm subs={data.subs} />
//     </AzureAuthCheckDisplay>
//   );
// }
