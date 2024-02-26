import { EaCMetadataBase } from "../../eac/EaCMetadataBase.ts";
import { EverythingAsCode } from "../../eac/EverythingAsCode.ts";

export type EaCHandlerConnectionsRequest = {
  Current: EaCMetadataBase;

  EaC: EverythingAsCode;

  Lookup: string;

  Model: EaCMetadataBase;

  ParentEaC?: EverythingAsCode;
};

export function isEaCHandlerConnectionsRequest(
  req: unknown,
): req is EaCHandlerConnectionsRequest {
  const handlerRequest = req as EaCHandlerConnectionsRequest;

  return (
    handlerRequest.Current !== undefined &&
    handlerRequest.EaC !== undefined &&
    handlerRequest.Model !== undefined
  );
}
