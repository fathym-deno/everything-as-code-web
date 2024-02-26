import { EverythingAsCode } from "../../eac/EverythingAsCode.ts";
import { DenoKVNonce } from "../../utils/deno-kv/DenoKVNonce.ts";

export type EaCCommitRequest = DenoKVNonce & {
  CommitID: string;

  EaC: EverythingAsCode;

  JWT: string;

  ProcessingSeconds: number;

  Username: string;
};

export function isEaCCommitRequest(req: unknown): req is EaCCommitRequest {
  const commitRequest = req as EaCCommitRequest;

  return (
    commitRequest.EaC !== undefined &&
    typeof commitRequest.EaC.EnterpriseLookup === "string" &&
    commitRequest.CommitID !== undefined &&
    typeof commitRequest.CommitID === "string" &&
    commitRequest.JWT !== undefined &&
    typeof commitRequest.JWT === "string" &&
    commitRequest.ProcessingSeconds !== undefined &&
    typeof commitRequest.ProcessingSeconds === "number" &&
    commitRequest.Username !== undefined &&
    typeof commitRequest.Username === "string"
  );
}
