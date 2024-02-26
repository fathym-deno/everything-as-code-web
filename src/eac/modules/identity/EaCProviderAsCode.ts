import { EaCDetails } from "../../EaCDetails.ts";
import {
  EaCProviderDetails,
  isEaCProviderDetails,
} from "./EaCProviderDetails.ts";

export type EaCProviderAsCode = {} & EaCDetails<EaCProviderDetails>;

export function isEaCProviderAsCode(eac: unknown): eac is EaCProviderAsCode {
  const id = eac as EaCProviderAsCode;

  return id && isEaCProviderDetails(id.Details);
}
