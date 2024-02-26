import { EaCMetadataBase } from "../../EaCMetadataBase.ts";
import { EaCIoTAsCode } from "./EaCIoTAsCode.ts";

export type EverythingAsCodeIoT = {
  IoT?: Record<string, EaCIoTAsCode>;
} & EaCMetadataBase;

export function isEverythingAsCodeIoT(
  eac: unknown,
): eac is EverythingAsCodeIoT {
  const iotEaC = eac as EverythingAsCodeIoT;

  return iotEaC.IoT !== undefined;
}
