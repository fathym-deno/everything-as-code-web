import { EaCCloudDeployment } from "../../../../api/models/EaCCloudDeployment.ts";
import { EaCHandlerCheckRequest } from "../../../../api/models/EaCHandlerCheckRequest.ts";

export type EaCHandlerCloudCheckRequest =
  & Omit<
    EaCCloudDeployment,
    "Deployment"
  >
  & EaCHandlerCheckRequest;
