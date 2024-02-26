import { EaCVertexDetails } from "../../EaCVertexDetails.ts";

export type EaCDeviceDetails = {
  IsIoTEdge: boolean;
} & EaCVertexDetails;
