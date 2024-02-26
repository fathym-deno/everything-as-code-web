import { WithSession } from "$fresh/session";
import { FathymEaC } from "../FathymEaC.ts";

export type EverythingAsCodeState =
  & {
    CloudLookup?: string;

    EaC?: FathymEaC;

    EaCJWT?: string;

    ResourceGroupLookup?: string;

    Username?: string;
  }
  & WithSession
  & Record<string, unknown>;
