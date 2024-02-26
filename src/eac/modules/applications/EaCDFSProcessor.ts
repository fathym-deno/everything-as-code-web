import {
  EaCDistributedFileSystem,
  isEaCDistributedFileSystem,
} from "./EaCDistributedFileSystem.ts";
import { EaCProcessor, isEaCProcessor } from "./EaCProcessor.ts";

export type EaCDFSProcessor = {
  DFS: EaCDistributedFileSystem;
} & EaCProcessor;

export function isEaCDFSProcessor(
  details: unknown,
): details is EaCDFSProcessor {
  const proc = details as EaCDFSProcessor;

  return (
    isEaCProcessor(proc) &&
    isEaCDistributedFileSystem(proc.DFS)
  );
}
