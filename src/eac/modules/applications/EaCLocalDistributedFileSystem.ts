import {
  EaCDistributedFileSystem,
  isEaCDistributedFileSystem,
} from "./EaCDistributedFileSystem.ts";

export type EaCLocalDistributedFileSystem = {
  FileRoot: string;
} & EaCDistributedFileSystem;

export function isEaCLocalDistributedFileSystem(
  details: unknown,
): details is EaCLocalDistributedFileSystem {
  const dfs = details as EaCLocalDistributedFileSystem;

  return (
    isEaCDistributedFileSystem(dfs) &&
    dfs.FileRoot !== undefined &&
    typeof dfs.FileRoot === "string"
  );
}
