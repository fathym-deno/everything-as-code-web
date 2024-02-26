import { FreshContext, Plugin, OAuthHelpers } from "../../../src.deps.ts";
import { EaCServiceClient } from "../../../eac/client/EaCServiceClient.ts";
import { GitHubAccessPluginState } from "./GitHubAccessPluginState.ts";
import { establishSigninCallbackRoute } from "./routes/signin/callback.ts";
import { establishSigninRoute } from "./routes/signin/index.ts";
import { establishSignoutRoute } from "./routes/signout.ts";

export type GitHubAccessPluginConfig<TState extends GitHubAccessPluginState> = {
  DenoKV: Deno.Kv;

  Handlers: OAuthHelpers;

  LoadEaCSvc: (ctx: FreshContext<TState>) => Promise<EaCServiceClient>;

  RootPath?: string;
};

export function gitHubAccessPlugin<TState extends GitHubAccessPluginState>(
  config: GitHubAccessPluginConfig<TState>,
): Plugin {
  const rootPath = config.RootPath || "/github/access";

  const signinRoute = establishSigninRoute(config.Handlers);

  const signinCallbackRoute = establishSigninCallbackRoute(
    config.Handlers,
    config.DenoKV,
    config.LoadEaCSvc,
  );

  const signoutRoute = establishSignoutRoute(config.Handlers);

  return {
    name: "fathym_github_access",
    routes: [
      {
        path: `${rootPath}/signin`,
        ...signinRoute,
      },
      {
        path: `${rootPath}/signin/callback`,
        ...signinCallbackRoute,
      },
      {
        path: `${rootPath}/signout`,
        ...signoutRoute,
      },
    ],
  };
}
