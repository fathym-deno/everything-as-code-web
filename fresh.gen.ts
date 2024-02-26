// DO NOT EDIT. This file is generated by Fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $_404 from "./routes/_404.tsx";
import * as $_app from "./routes/_app.tsx";
import * as $_middleware from "./routes/_middleware.tsx";
import * as $dashboard_middleware from "./routes/dashboard/_middleware.tsx";
import * as $dashboard_api_eac_index from "./routes/dashboard/api/eac/index.ts";
import * as $dashboard_azure_access_signin_callback from "./routes/dashboard/azure/access/signin/callback.ts";
import * as $dashboard_azure_access_signin_index from "./routes/dashboard/azure/access/signin/index.ts";
import * as $dashboard_azure_access_signout from "./routes/dashboard/azure/access/signout.ts";
import * as $dashboard_clouds_azure_index from "./routes/dashboard/clouds/azure/index.tsx";
import * as $dashboard_clouds_azure_new from "./routes/dashboard/clouds/azure/new.tsx";
import * as $dashboard_clouds_calz from "./routes/dashboard/clouds/calz.tsx";
import * as $dashboard_enterprise_index from "./routes/dashboard/enterprise/index.tsx";
import * as $dashboard_github_app_index from "./routes/dashboard/github-app/index.tsx";
import * as $dashboard_index from "./routes/dashboard/index.tsx";
import * as $dashboard_jwt_index from "./routes/dashboard/jwt/index.tsx";
import * as $index from "./routes/index.tsx";
import * as $EntepriseManagementItem from "./islands/EntepriseManagementItem.tsx";
import { type Manifest } from "$fresh/server.ts";

const manifest = {
  routes: {
    "./routes/_404.tsx": $_404,
    "./routes/_app.tsx": $_app,
    "./routes/_middleware.tsx": $_middleware,
    "./routes/dashboard/_middleware.tsx": $dashboard_middleware,
    "./routes/dashboard/api/eac/index.ts": $dashboard_api_eac_index,
    "./routes/dashboard/azure/access/signin/callback.ts":
      $dashboard_azure_access_signin_callback,
    "./routes/dashboard/azure/access/signin/index.ts":
      $dashboard_azure_access_signin_index,
    "./routes/dashboard/azure/access/signout.ts":
      $dashboard_azure_access_signout,
    "./routes/dashboard/clouds/azure/index.tsx": $dashboard_clouds_azure_index,
    "./routes/dashboard/clouds/azure/new.tsx": $dashboard_clouds_azure_new,
    "./routes/dashboard/clouds/calz.tsx": $dashboard_clouds_calz,
    "./routes/dashboard/enterprise/index.tsx": $dashboard_enterprise_index,
    "./routes/dashboard/github-app/index.tsx": $dashboard_github_app_index,
    "./routes/dashboard/index.tsx": $dashboard_index,
    "./routes/dashboard/jwt/index.tsx": $dashboard_jwt_index,
    "./routes/index.tsx": $index,
  },
  islands: {
    "./islands/EntepriseManagementItem.tsx": $EntepriseManagementItem,
  },
  baseUrl: import.meta.url,
} satisfies Manifest;

export default manifest;
