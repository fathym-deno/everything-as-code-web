import { loadJwtConfig } from "../../../configs/jwt.config.ts";
import { EaCAPIJWTPayload } from "../../../src/api/EaCAPIJWTPayload.ts";
import { buildJwtValidationHandler } from "../../../src/utils/jwt/middleware.ts";

export const handler = [
  buildJwtValidationHandler<EaCAPIJWTPayload>(loadJwtConfig()),
];
