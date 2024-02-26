import { OpenAIBaseInput } from "../../../src.deps.ts";
import {
  EaCEmbeddingsDetails,
  isEaCEmbeddingsDetails,
} from "./EaCEmbeddingsDetails.ts";

export type EaCAzureOpenAIEmbeddingsDetails = {
  DeploymentName: string;
} & EaCEmbeddingsDetails;

export function isEaCAzureOpenAIEmbeddingsDetails(
  details: unknown,
): details is EaCAzureOpenAIEmbeddingsDetails {
  const llmDetails = details as EaCAzureOpenAIEmbeddingsDetails;

  return (
    isEaCEmbeddingsDetails(llmDetails) &&
    llmDetails.DeploymentName !== undefined &&
    typeof llmDetails.DeploymentName === "string"
  );
}
