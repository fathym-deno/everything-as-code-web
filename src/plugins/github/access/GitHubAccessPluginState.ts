import { EverythingAsCode } from "../../../eac/EverythingAsCode.ts";
import { EverythingAsCodeSources } from "../../../eac/modules/sources/EverythingAsCodeSources.ts";

export type GitHubAccessPluginState = {
  EaC?: EverythingAsCode & EverythingAsCodeSources;

  Username?: string;
};
