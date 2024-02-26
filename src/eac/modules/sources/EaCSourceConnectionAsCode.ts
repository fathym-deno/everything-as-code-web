import { EaCDetails } from "../../EaCDetails.ts";
import { EaCSourceConnectionDetails } from "./EaCSourceConnectionDetails.ts";

export type EaCSourceConnectionAsCode = {
  GitHubAppLookup?: string;
} & EaCDetails<EaCSourceConnectionDetails>;
