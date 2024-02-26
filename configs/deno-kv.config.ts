import "$std/dotenv/load.ts";
import { initializeDenoKv } from "@fathym/eac";

export const denoKv = await initializeDenoKv(
  Deno.env.get("DENO_KV_PATH") || undefined,
);

export const fathymDenoKv = await initializeDenoKv(
  Deno.env.get("FATHYM_DENO_KV_PATH") || undefined,
);
