import { EaCDetails } from "../../EaCDetails.ts";
import {
  EaCVectorStoreDetails,
  isEaCVectorStoreDetails,
} from "./EaCVectorStoreDetails.ts";

export type EaCVectorStoreAsCode = {} & EaCDetails<EaCVectorStoreDetails>;

export function isEaCVectorStoreAsCode(
  eac: unknown,
): eac is EaCVectorStoreAsCode {
  const vs = eac as EaCVectorStoreAsCode;

  return vs && isEaCVectorStoreDetails(vs.Details);
}
