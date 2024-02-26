import { EaCDetails } from "./EaCDetails.ts";
import { EaCSecretDetails } from "./EaCSecretDetails.ts";

export type EaCSecretAsCode = {
  CloudLookup?: string;

  KeyVaultLookup?: string;
} & EaCDetails<EaCSecretDetails>;
