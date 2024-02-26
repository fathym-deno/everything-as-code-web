import { EaCHandler } from "../eac/EaCHandler.ts";

export type EaCHandlers = {
  Force?: boolean;
} & Record<string, EaCHandler | null>;
