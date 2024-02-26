import { EaCHandlers } from "../api/EaCHandlers.ts";
import { EaCDetails } from "./EaCDetails.ts";
import { EaCEnterpriseDetails } from "./EaCEnterpriseDetails.ts";
import { EaCSecretAsCode } from "./EaCSecretAsCode.ts";

export type EverythingAsCode = {
  EnterpriseLookup?: string;

  Handlers?: EaCHandlers;

  ParentEnterpriseLookup?: string;

  Secrets?: Record<string, EaCSecretAsCode | null>;
} & EaCDetails<EaCEnterpriseDetails>;

export type EaCDiff = Omit<
  EverythingAsCode,
  "EnterpriseLookup" | "ParentEnterpriseLookup" | "Details"
>;

//   AccessRights?: { [key: string]: EaCAccessRightAsCode };
//   Applications?: { [key: string]: EaCApplicationAsCode };
//   DataTokens?: { [key: string]: EaCDataTokenAsCode };
//   Hosts?: { [key: string]: EaCHostAsCode };
//   LicenseConfigurations?: { [key: string]: EaCLicenseConfigurationAsCode };
//   Modifiers?: { [key: string]: EaCDFSModifierAsCode };
//   PrimaryHost?: string;
//   Projects?: { [key: string]: EaCProjectAsCode };
//   Providers?: { [key: string]: EaCProviderAsCode };
