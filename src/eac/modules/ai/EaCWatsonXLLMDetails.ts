import { EaCLLMDetails, isEaCLLMDetails } from "./EaCLLMDetails.ts";

export type EaCWatsonXLLMDetails = {
  ModelID: string;

  ModelParameters?: Record<string, unknown>;

  ProjectID: string;
} & EaCLLMDetails;

export function isEaCWatsonXLLMDetails(
  details: unknown,
): details is EaCWatsonXLLMDetails {
  const llmDetails = details as EaCWatsonXLLMDetails;

  return (
    isEaCLLMDetails(llmDetails) &&
    llmDetails.APIKey !== undefined &&
    typeof llmDetails.APIKey === "string" &&
    llmDetails.ModelID !== undefined &&
    typeof llmDetails.ModelID === "string" &&
    llmDetails.ProjectID !== undefined &&
    typeof llmDetails.ProjectID === "string"
  );
}
