import { EaCVertexDetails } from "../../EaCVertexDetails.ts";

export type EaCCloudResourceDetails = {
  Order: number;

  Type: "Format" | "Container";
} & EaCVertexDetails;
