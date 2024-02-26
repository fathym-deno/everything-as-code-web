export type EaCDistributedFileSystem = {
  DefaultFile?: string;
};

export function isEaCDistributedFileSystem(
  details: unknown,
): details is EaCDistributedFileSystem {
  const dfs = details as EaCDistributedFileSystem;

  return !!dfs;
}
