import { existsSync, path } from "../../src.deps.ts";

export async function initializeDenoKv(denoKvPath?: string) {
  console.log(`Initializing DenoKV at ${denoKvPath}`);

  if (
    denoKvPath &&
    !denoKvPath.startsWith("https") &&
    !existsSync(denoKvPath)
  ) {
    const denoKvDir = path.dirname(denoKvPath);

    if (denoKvDir && !existsSync(denoKvDir)) {
      console.log(`Ensuring DenoKV directory ${denoKvDir}`);

      Deno.mkdirSync(denoKvDir);
    }
  }

  console.log(`Loading DenoKV instance for ${denoKvPath}`);

  const kv = await Deno.openKv(denoKvPath);

  console.log(`Inititialized DenoKV database: ${denoKvPath || "$default"}`);

  return kv;
}
