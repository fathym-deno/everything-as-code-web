import { EverythingAsCode } from "../../eac/EverythingAsCode.ts";
import { DenoKVNonce } from "../../utils/deno-kv/DenoKVNonce.ts";
import { EaCCommitRequest } from "./EaCCommitRequest.ts";
import { EaCHandlerCheckRequest } from "./EaCHandlerCheckRequest.ts";

export type EaCCommitCheckRequest =
  & {
    Checks: EaCHandlerCheckRequest[];

    OriginalEaC: EverythingAsCode;

    ToProcessKeys: string[];
  }
  & EaCCommitRequest;

export function isEaCCommitCheckRequest(
  req: unknown,
): req is EaCCommitCheckRequest {
  const commitRequest = req as EaCCommitCheckRequest;

  return (
    commitRequest.Checks !== undefined &&
    Array.isArray(commitRequest.Checks) &&
    commitRequest.OriginalEaC !== undefined &&
    commitRequest.ToProcessKeys !== undefined &&
    Array.isArray(commitRequest.ToProcessKeys)
  );
}
