import { EaCVertexDetails } from "../../EaCVertexDetails.ts";

export type EaCCloudResourceGroupDetails = {
  Location?: string;

  Order?: number;
} & EaCVertexDetails;
