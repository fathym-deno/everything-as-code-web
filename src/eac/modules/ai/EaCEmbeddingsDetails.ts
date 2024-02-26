import { EaCVertexDetails } from "../../EaCVertexDetails.ts";

export type EaCEmbeddingsDetails = {
  APIKey: string;

  Endpoint: string;
} & EaCVertexDetails;

export function isEaCEmbeddingsDetails(
  details: unknown,
): details is EaCEmbeddingsDetails {
  const llmDetails = details as EaCEmbeddingsDetails;

  return (
    llmDetails &&
    llmDetails.APIKey !== undefined &&
    typeof llmDetails.APIKey === "string" &&
    llmDetails.Endpoint !== undefined &&
    typeof llmDetails.Endpoint === "string"
  );
}
