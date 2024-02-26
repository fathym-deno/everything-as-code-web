import { EverythingAsCode } from "./eac/EverythingAsCode.ts";
import { EverythingAsCodeClouds } from "./eac/modules/clouds/EverythingAsCodeClouds.ts";
import { EverythingAsCodeGitHub } from "./eac/modules/github/EverythingAsCodeGitHub.ts";
import { EverythingAsCodeIoT } from "./eac/modules/iot/EverythingAsCodeIoT.ts";
import { EverythingAsCodeSources } from "./eac/modules/sources/EverythingAsCodeSources.ts";

export type FathymEaC =
  & EverythingAsCode
  & EverythingAsCodeClouds
  & EverythingAsCodeIoT
  & EverythingAsCodeGitHub
  & EverythingAsCodeSources;
