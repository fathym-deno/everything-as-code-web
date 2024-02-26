import { EaCDetails } from "../../EaCDetails.ts";
import { EaCAIDetails, isEaCAIDetails } from "./EaCAIDetails.ts";
import { EaCEmbeddingsAsCode } from "./EaCEmbeddingsAsCode.ts";
import { EaCLLMAsCode } from "./EaCLLMAsCode.ts";
import { EaCVectorStoreAsCode } from "./EaCVectorStoreAsCode.ts";

export type EaCAIAsCode = {
  Embeddings?: Record<string, EaCEmbeddingsAsCode>;

  LLMs?: Record<string, EaCLLMAsCode>;

  VectorStores?: Record<string, EaCVectorStoreAsCode>;
} & EaCDetails<EaCAIDetails>;

export function isEaCAIAsCode(eac: unknown): eac is EaCAIAsCode {
  const ai = eac as EaCAIAsCode;

  return ai && isEaCAIDetails(ai.Details);
}
