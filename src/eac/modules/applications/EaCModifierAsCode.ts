import { EaCDetails } from "../../EaCDetails.ts";
import {
  EaCModifierDetails,
  isEaCModifierDetails,
} from "./EaCModifierDetails.ts";

export type EaCModifierAsCode = {} & EaCDetails<EaCModifierDetails>;

export function isEaCModifierAsCode(eac: unknown): eac is EaCModifierAsCode {
  const mod = eac as EaCModifierAsCode;

  return mod && mod.Details !== undefined && isEaCModifierDetails(mod.Details);
}
