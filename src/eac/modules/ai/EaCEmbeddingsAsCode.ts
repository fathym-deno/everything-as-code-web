import { EaCDetails } from "../../EaCDetails.ts";
import {
  EaCEmbeddingsDetails,
  isEaCEmbeddingsDetails,
} from "./EaCEmbeddingsDetails.ts";

export type EaCEmbeddingsAsCode = {} & EaCDetails<EaCEmbeddingsDetails>;

export function isEaCEmbeddingsAsCode(
  eac: unknown,
): eac is EaCEmbeddingsAsCode {
  const embeddings = eac as EaCEmbeddingsAsCode;

  return embeddings && isEaCEmbeddingsDetails(embeddings.Details);
}
