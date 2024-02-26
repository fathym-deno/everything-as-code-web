import { EaCVertexDetails } from "../../EaCVertexDetails.ts";

export type EaCDevOpsActionDetails = {
  Path?: string | null;

  Templates?: string[] | null;
} & EaCVertexDetails;
