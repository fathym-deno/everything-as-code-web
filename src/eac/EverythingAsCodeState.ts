import { WithSession } from "$fresh/session";
import { FathymEaC } from "@fathym/eac/api";

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
