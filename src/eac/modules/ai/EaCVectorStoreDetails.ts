import { EaCVertexDetails } from "../../EaCVertexDetails.ts";

export type EaCVectorStoreDetails = {
  EmbeddingsLookup: string;
} & EaCVertexDetails;

export function isEaCVectorStoreDetails(
  details: unknown,
): details is EaCVectorStoreDetails {
  const vsDetails = details as EaCVectorStoreDetails;

  return (
    vsDetails &&
    vsDetails.EmbeddingsLookup !== undefined &&
    typeof vsDetails.EmbeddingsLookup === "string"
  );
}
