import { defineConfig, FreshContext } from "$fresh/server.ts";
import tailwind from "$fresh/plugins/tailwind.ts";
import { iconSetPlugin } from "@fathym/atomic-icons";
import { curIconSetGenerateConfig } from "./configs/fathym-atomic-icons.config.ts";
// import { msalPlugin } from "@fathym/msal";
// import { msalPluginConfig } from "./configs/msal.config.ts";
import { gitHubOAuth } from "./configs/oAuth.config.ts";
import { gitHubAccessPlugin } from "./src/plugins/github/access/github-access.plugin.ts";
import { fathymDenoKv } from "./configs/deno-kv.config.ts";
import { loadEaCSvc } from "./configs/eac.ts";
import { GitHubAccessPluginState } from "./src/plugins/github/access/GitHubAccessPluginState.ts";
import { EverythingAsCodeState } from "./src/eac/EverythingAsCodeState.ts";

export default defineConfig({
  plugins: [
    tailwind(),
    await iconSetPlugin(curIconSetGenerateConfig),
    // msalPlugin(msalPluginConfig),
    gitHubAccessPlugin({
      DenoKV: fathymDenoKv,
      Handlers: gitHubOAuth,
      LoadEaCSvc: async (ctx: FreshContext<EverythingAsCodeState>) => {
        return await loadEaCSvc(
          ctx.state.EaC!.EnterpriseLookup!,
          ctx.state.Username!,
        );
      },
      RootPath: "/dashboard/github/access",
    }),
  ],
  server: {
    port: 5437,
  },
});
