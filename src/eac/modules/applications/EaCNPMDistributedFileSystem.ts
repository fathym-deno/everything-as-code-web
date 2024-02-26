import {
  EaCDistributedFileSystem,
  isEaCDistributedFileSystem,
} from "./EaCDistributedFileSystem.ts";

export type EaCNPMDistributedFileSystem = {
  Package: string;

  Version: string;
} & EaCDistributedFileSystem;

export function isEaCNPMDistributedFileSystem(
  details: unknown,
): details is EaCNPMDistributedFileSystem {
  const proc = details as EaCNPMDistributedFileSystem;

  return (
    isEaCDistributedFileSystem(proc) &&
    proc.Package !== undefined &&
    typeof proc.Package === "string" &&
    proc.Version !== undefined &&
    typeof proc.Version === "string"
  );
}
