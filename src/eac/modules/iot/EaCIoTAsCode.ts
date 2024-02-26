import { EaCDetails } from "../../EaCDetails.ts";
import { EaCDashboardAsCode } from "./EaCDashboardAsCode.ts";
import { EaCDeviceAsCode } from "./EaCDeviceAsCode.ts";
import { EaCIoTDetails } from "./EaCIoTDetails.ts";

export type EaCIoTAsCode = {
  CloudLookup?: string;

  Dashboards?: Record<string, EaCDashboardAsCode> | null;

  Devices?: Record<string, EaCDeviceAsCode> | null;

  ResourceGroupLookup?: string;
} & EaCDetails<EaCIoTDetails>;
