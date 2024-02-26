// deno-lint-ignore-file no-explicit-any
import { BaseMessagePromptTemplateLike } from "../../../src.deps.ts";
import { EaCProcessor, isEaCProcessor } from "./EaCProcessor.ts";

export type EaCAIChatProcessor = {
  AILookup: string;

  DefaultInput?: any;

  DefaultRAGInput?: any;

  LLMLookup: string;

  EmbeddingsLookup: string;

  Messages: BaseMessagePromptTemplateLike[];

  UseSSEFormat: boolean;

  VectorStoreLookup: string;
} & EaCProcessor;

export function isEaCAIChatProcessor(
  details: unknown,
): details is EaCAIChatProcessor {
  const proc = details as EaCAIChatProcessor;

  return (
    isEaCProcessor(proc) &&
    proc.LLMLookup !== undefined &&
    typeof proc.LLMLookup === "string" &&
    proc.EmbeddingsLookup !== undefined &&
    typeof proc.EmbeddingsLookup === "string" &&
    proc.VectorStoreLookup !== undefined &&
    typeof proc.VectorStoreLookup === "string"
  );
}
