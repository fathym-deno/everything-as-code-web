import { merge } from "@fathym/common";
import { ResourceManagementClient } from "npm:@azure/arm-resources";

export async function loadResoureTypeApiVersions(
  resClient: ResourceManagementClient,
  resourceTypes: string[],
): Promise<Record<string, string>> {
  const calls = resourceTypes.map(async (resourceType) => {
    const [providerType, ...resType] = resourceType.split("/");

    const provider = await resClient.providers.get(providerType);

    const providerTypeApiVersions = provider.resourceTypes
      ?.filter((rt) => {
        return resType.join("/") === rt.resourceType!;
      })
      .map((rt) => {
        return {
          type: [providerType, rt.resourceType!].join("/"),
          apiVersion: rt.defaultApiVersion || rt.apiVersions![0],
        };
      })!;

    const res = providerTypeApiVersions.reduce((p, c) => {
      p[c.type] = c.apiVersion;

      return p;
    }, {} as Record<string, string>);

    return res;
  });

  const apiVersionResults = await Promise.all(calls);

  return merge(...apiVersionResults);
}
