import { EaCCloudResourceAsCode } from "./EaCCloudResourceAsCode.ts";

export type EaCCloudWithResources = {
  Resources?: Record<string, EaCCloudResourceAsCode> | null;
};
