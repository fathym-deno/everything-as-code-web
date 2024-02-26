import { EaCMetadataBase } from "../../EaCMetadataBase.ts";
import { EaCAIAsCode } from "./EaCAIAsCode.ts";

export type EverythingAsCodeAI = {
  AIs?: Record<string, EaCAIAsCode>;
} & EaCMetadataBase;

export function isEverythingAsCodeAI(
  eac: unknown,
): eac is EverythingAsCodeAI {
  const idEaC = eac as EverythingAsCodeAI;

  return (
    idEaC.Databases !== undefined
  );
}
