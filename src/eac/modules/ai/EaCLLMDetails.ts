import { EaCVertexDetails } from "../../EaCVertexDetails.ts";

export type EaCLLMDetails = {
  APIKey?: string;

  Endpoint?: string;

  Streaming?: boolean;

  Verbose?: boolean;
} & EaCVertexDetails;

export function isEaCLLMDetails(details: unknown): details is EaCLLMDetails {
  const llmDetails = details as EaCLLMDetails;

  return !!llmDetails;
}
