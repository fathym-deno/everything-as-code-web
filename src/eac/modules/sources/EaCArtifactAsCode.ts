import { EaCDetails } from "../../EaCDetails.ts";
import { EaCArtifactDetails } from "./EaCArtifactDetails.ts";

export type EaCArtifactAsCode = {
  ArtifactLookups?: string[] | null;

  DevOpsActionTriggerLookup?: string | null;

  Parameters?: Record<string, unknown>;
} & EaCDetails<EaCArtifactDetails>;
