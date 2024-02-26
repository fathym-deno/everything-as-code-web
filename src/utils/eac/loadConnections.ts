import { EaCMetadataBase } from "../../eac/EaCMetadataBase.ts";
import { EverythingAsCode } from "../../eac/EverythingAsCode.ts";
import { EaCHandler } from "../../eac/EaCHandler.ts";
import { callEaCHandlerConnections } from "./helpers.ts";
import { denoKv } from "../../../configs/deno-kv.config.ts";

export async function loadConnections(
  currentEaC: EverythingAsCode,
  handler: EaCHandler,
  jwt: string,
  def: Record<string, EaCMetadataBase>,
  current: Record<string, EaCMetadataBase>,
  lookups: string[],
): Promise<Record<string, EaCMetadataBase>> {
  const mappedCalls = lookups!.map(async (lookup) => {
    return {
      Lookup: lookup,
      Result: await callEaCHandlerConnections(
        async (entLookup) => {
          const eac = await denoKv.get<EverythingAsCode>(["EaC", entLookup]);

          return eac.value!;
        },
        handler,
        jwt,
        {
          Current: current![lookup],
          EaC: currentEaC,
          Lookup: lookup,
          Model: def![lookup],
        },
      ),
    };
  }, {});

  const mapped = await Promise.all(mappedCalls);

  return mapped.reduce((conns, res) => {
    conns[res.Lookup] = res.Result.Model;

    return conns;
  }, {} as Record<string, EaCMetadataBase>);
}
