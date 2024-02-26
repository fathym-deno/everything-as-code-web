import { EaCDetails } from "../../EaCDetails.ts";
import { EaCProjectDetails, isEaCProjectDetails } from "./EaCProjectDetails.ts";
import { EaCApplicationLookupConfiguration } from "./EaCApplicationLookupConfiguration.ts";
import { EaCProjectLookupConfiguration } from "./EaCProjectLookupConfiguration.ts";

export type EaCProjectAsCode = {
  ApplicationLookups: Record<string, EaCApplicationLookupConfiguration>;

  LookupConfigs: Record<string, EaCProjectLookupConfiguration>;

  ModifierLookups?: string[];
} & EaCDetails<EaCProjectDetails>;

export function isEaCProjectAsCode(eac: unknown): eac is EaCProjectAsCode {
  const proj = eac as EaCProjectAsCode;

  return (
    proj &&
    proj.Details !== undefined &&
    isEaCProjectDetails(proj.Details) &&
    proj.ApplicationLookups !== undefined &&
    proj.LookupConfigs !== undefined
  );
}
