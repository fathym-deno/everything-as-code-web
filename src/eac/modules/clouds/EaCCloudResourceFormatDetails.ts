import { EaCCloudResourceDetails } from "./EaCCloudResourceDetails.ts";

export type EaCCloudResourceFormatDetails = {
  Data?: Record<string, unknown>;

  Outputs?: Record<string, string>;

  Template: {
    Content: string;

    Parameters: string;
  };
} & EaCCloudResourceDetails;
