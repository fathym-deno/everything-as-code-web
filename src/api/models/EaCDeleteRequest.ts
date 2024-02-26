import { EverythingAsCode } from "../../eac/EverythingAsCode.ts";
import { DenoKVNonce } from "../../utils/deno-kv/DenoKVNonce.ts";

export type EaCDeleteRequest = DenoKVNonce & {
  Archive: boolean;

  CommitID: string;

  EaC: EverythingAsCode;

  JWT: string;

  ProcessingSeconds: number;

  Username: string;
};

export function isEaCDeleteRequest(req: unknown): req is EaCDeleteRequest {
  const deleteRequest = req as EaCDeleteRequest;

  return (
    deleteRequest.EaC !== undefined &&
    deleteRequest.EaC.EnterpriseLookup !== undefined &&
    typeof deleteRequest.EaC.EnterpriseLookup === "string" &&
    typeof deleteRequest.Archive === "boolean" &&
    deleteRequest.CommitID !== undefined &&
    typeof deleteRequest.CommitID === "string"
  );
}
