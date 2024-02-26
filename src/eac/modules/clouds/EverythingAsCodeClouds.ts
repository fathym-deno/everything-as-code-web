import { EaCMetadataBase } from "../../EaCMetadataBase.ts";
import { EaCCloudAsCode } from "./EaCCloudAsCode.ts";

export type EverythingAsCodeClouds = {
  Clouds?: Record<string, EaCCloudAsCode> | null;
} & EaCMetadataBase;

export function isEverythingAsCodeClouds(
  eac: unknown,
): eac is EverythingAsCodeClouds {
  const iotEaC = eac as EverythingAsCodeClouds;

  return (
    iotEaC.Clouds !== undefined
  );
}
