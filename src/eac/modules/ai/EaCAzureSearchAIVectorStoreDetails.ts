import { AzureAISearchQueryType } from "../../../src.deps.ts";
import {
  EaCVectorStoreDetails,
  isEaCVectorStoreDetails,
} from "./EaCVectorStoreDetails.ts";

export type EaCAzureSearchAIVectorStoreDetails = {
  APIKey: string;

  Endpoint: string;

  QueryType: AzureAISearchQueryType;
} & EaCVectorStoreDetails;

export function isEaCAzureSearchAIVectorStoreDetails(
  details: unknown,
): details is EaCAzureSearchAIVectorStoreDetails {
  const vsDetails = details as EaCAzureSearchAIVectorStoreDetails;

  return (
    isEaCVectorStoreDetails(vsDetails) &&
    vsDetails.APIKey !== undefined &&
    typeof vsDetails.APIKey === "string" &&
    vsDetails.Endpoint !== undefined &&
    typeof vsDetails.Endpoint === "string"
  );
}
