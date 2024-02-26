import { EaCDetails } from "../../EaCDetails.ts";
import {
  EaCApplicationDetails,
  isEaCApplicationDetails,
} from "./EaCApplicationDetails.ts";
import { EaCProcessor } from "./EaCProcessor.ts";

export type EaCApplicationAsCode = {
  ModifierLookups?: string[];

  Processor: EaCProcessor;
} & EaCDetails<EaCApplicationDetails>;

export function isEaCApplicationAsCode(
  eac: unknown,
): eac is EaCApplicationAsCode {
  const app = eac as EaCApplicationAsCode;

  return (
    app &&
    app.Details !== undefined &&
    isEaCApplicationDetails(app.Details) &&
    app.Processor !== undefined
  );
}
