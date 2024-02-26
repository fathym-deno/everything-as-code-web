// import * as msal from "npm:@azure/msal-node@2.1.0";
// import { Configuration } from "npm:@azure/msal-node@2.1.0";
// import { MSALAuthProvider, MSALPluginConfiguration } from "@fathym/msal";
// import { fathymDenoKv } from "./deno-kv.config.ts";

// export const msalCryptoProvider = new msal.CryptoProvider();

// export const msalConfig: Configuration = {
//   auth: {
//     clientId: Deno.env.get("MSAL_CLIENT_ID")!,
//     authority: Deno.env.get("MSAL_CLOUD_INSTANCE")! +
//       Deno.env.get("MSAL_TENANT_ID")!,
//     clientSecret: Deno.env.get("MSAL_CLIENT_SECRET")!,
//   },
//   system: {
//     loggerOptions: {
//       loggerCallback(_loglevel, message, _containsPii) {
//         console.log(message);
//       },
//       piiLoggingEnabled: false,
//       logLevel: 3,
//     },
//   },
// };

// export const MSAL_REDIRECT_URI = Deno.env.get("MSAL_REDIRECT_URI")!;
// export const MSAL_POST_LOGOUT_REDIRECT_URI = Deno.env.get(
//   "MSAL_POST_LOGOUT_REDIRECT_URI",
// )!;

// export const msalAuthProvider = new MSALAuthProvider(
//   msalConfig,
//   msalCryptoProvider,
//   fathymDenoKv,
// );

// export const msalPluginConfig: MSALPluginConfiguration = {
//   MSALAuthProvider: msalAuthProvider,
//   MSALSignInOptions: {
//     Scopes: ["https://management.core.windows.net//.default"],
//     // Scopes: ["https://management.core.windows.net//user_impersonation"],
//     RedirectURI: MSAL_REDIRECT_URI,
//     SuccessRedirect: "/dashboard/clouds/azure/new",
//   },
//   MSALSignOutOptions: {
//     ClearSession: false,
//     PostLogoutRedirectUri: MSAL_POST_LOGOUT_REDIRECT_URI,
//   },
//   RootPath: "dashboard/clouds/azure/auth",
// };
