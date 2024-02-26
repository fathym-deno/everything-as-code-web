import {
  Client as KustoClient,
  KustoConnectionStringBuilder,
} from "npm:azure-kusto-data";
import { TokenCredential } from "npm:@azure/identity";
import { EverythingAsCodeClouds } from "../../eac/modules/clouds/EverythingAsCodeClouds.ts";
import { loadAzureCloudCredentials } from "../../utils/eac/loadAzureCloudCredentials.ts";
import { EaCCloudWithResources } from "../../eac/modules/clouds/EaCCloudWithResources.ts";
import { EaCCloudResourceAsCode } from "../../eac/modules/clouds/EaCCloudResourceAsCode.ts";
import { EaCCloudResourceFormatDetails } from "../../eac/modules/clouds/EaCCloudResourceFormatDetails.ts";

const kustoClientCache: Record<string, KustoClient> = {};

export function loadKustoClient(
  entLookup: string,
  cloudLookup: string,
  resGroupLookup: string,
  resLookups: string[],
  loadEaC: (entLookup: string) => Promise<EverythingAsCodeClouds>,
  svcSuffix?: string,
): Promise<KustoClient>;

export function loadKustoClient(
  cluster: string,
  region: string,
  creds: TokenCredential,
): Promise<KustoClient>;

export async function loadKustoClient(
  clusterEntLookup: string,
  regionCloudLookup: string,
  credsResGroupLookup: TokenCredential | string,
  resLookups?: string[],
  loadEaC?: (entLookup: string) => Promise<EverythingAsCodeClouds>,
  svcSuffix?: string,
): Promise<KustoClient> {
  let [cluster, region, creds] = [
    clusterEntLookup,
    regionCloudLookup,
    credsResGroupLookup as TokenCredential,
  ];

  let clusterConectionString = "";

  if (typeof credsResGroupLookup === "string") {
    clusterConectionString =
      `${clusterEntLookup}|${regionCloudLookup}|${credsResGroupLookup as string}|${
        resLookups?.join("-")
      }`;
  } else {
    clusterConectionString = `https://${cluster}.${region}.kusto.windows.net`;
  }

  if (!(clusterConectionString in kustoClientCache)) {
    if (typeof credsResGroupLookup === "string") {
      // Received enterprise lookup and cloud lookup to consruct
      const [entLookup, cloudLookup, resGroupLookup] = [
        clusterEntLookup,
        regionCloudLookup,
        credsResGroupLookup as string,
      ];

      const eac = await loadEaC!(entLookup);

      creds = await loadAzureCloudCredentials(eac, cloudLookup);

      const cloud = eac.Clouds![cloudLookup];

      const resGroup = cloud.ResourceGroups![resGroupLookup];

      const resource = resLookups?.reduce((prev, resLookup) => {
        const res = prev.Resources![resLookup];

        return res;
      }, resGroup as EaCCloudWithResources) as EaCCloudResourceAsCode;

      const resDetails = resource.Details! as EaCCloudResourceFormatDetails;

      region = resDetails.Data!.Location as string;

      const shortName = resDetails.Data!.ShortName as string;

      if (!svcSuffix) {
        svcSuffix = `-data-explorer`;
      }

      cluster = `${shortName}${svcSuffix}`;

      clusterConectionString = `https://${cluster}.${region}.kusto.windows.net`;
    }

    const kcs = KustoConnectionStringBuilder.withTokenCredential(
      clusterConectionString,
      creds,
    );

    kustoClientCache[clusterConectionString] = new KustoClient(kcs);
  }

  return kustoClientCache[clusterConectionString];
}
