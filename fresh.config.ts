import { defineConfig, FreshContext, Plugin } from "$fresh/server.ts";
import tailwind from "$fresh/plugins/tailwind.ts";
import { iconSetPlugin } from "@fathym/atomic-icons";
import { loadEaCSvc, waitForStatus } from "@fathym/eac/api";
import { gitHubAccessPlugin } from "@fathym/eac/fresh";
import { curIconSetGenerateConfig } from "./configs/fathym-atomic-icons.config.ts";
// import { msalPlugin } from "@fathym/msal";
// import { msalPluginConfig } from "./configs/msal.config.ts";
import { gitHubOAuth } from "./configs/oAuth.config.ts";
import { fathymDenoKv } from "./configs/deno-kv.config.ts";

export default defineConfig({
  plugins: [
    tailwind(),
    await iconSetPlugin(curIconSetGenerateConfig),
    // msalPlugin(msalPluginConfig),
    gitHubAccessPlugin({
      DenoKV: fathymDenoKv,
      Handlers: gitHubOAuth,
      ProcessSrcConnDetails: async (ctx, srcConnLookup, srcConnDetails) => {
        const eacSvc = await loadEaCSvc(
          ctx.state.EaC!.EnterpriseLookup!,
          ctx.state.Username!,
        );

        const commitResp = await eacSvc.Commit(
          {
            EnterpriseLookup: ctx.state.EaC!.EnterpriseLookup!,
            SourceConnections: {
              [srcConnLookup]: {
                Details: srcConnDetails,
                GitHubAppLookup: Deno.env.get("GITHUB_APP_ID"),
              },
            },
          },
          60,
        );

        await waitForStatus(
          eacSvc,
          commitResp.EnterpriseLookup,
          commitResp.CommitID,
        );
      },
      RootPath: "/dashboard/github/access",
    }) as Plugin,
  ],
  server: {
    port: 5437,
  },
});
