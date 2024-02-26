import { EaCMetadataBase } from "../../eac/EaCMetadataBase.ts";
import { EverythingAsCode } from "../../eac/EverythingAsCode.ts";

export type EaCHandlerRequest = {
  CommitID: string;

  EaC: EverythingAsCode;

  Lookup: string;

  Model: EaCMetadataBase;

  ParentEaC?: EverythingAsCode;
};

export function isEaCHandlerRequest(req: unknown): req is EaCHandlerRequest {
  const handlerRequest = req as EaCHandlerRequest;

  return (
    handlerRequest.EaC !== undefined &&
    typeof handlerRequest.EaC.EnterpriseLookup === "string" &&
    handlerRequest.Lookup !== undefined &&
    typeof handlerRequest.Lookup === "string" &&
    handlerRequest.Model !== undefined
  );
}
