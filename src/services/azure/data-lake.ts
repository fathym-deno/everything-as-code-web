import { DataLakeServiceClient } from "npm:@azure/storage-file-datalake";
import { TokenCredential } from "npm:@azure/identity";
import { EverythingAsCodeClouds } from "../../eac/modules/clouds/EverythingAsCodeClouds.ts";
import { loadAzureCloudCredentials } from "../../utils/eac/loadAzureCloudCredentials.ts";
import { EaCCloudWithResources } from "../../eac/modules/clouds/EaCCloudWithResources.ts";
import { EaCCloudResourceAsCode } from "../../eac/modules/clouds/EaCCloudResourceAsCode.ts";
import { EaCCloudResourceFormatDetails } from "../../eac/modules/clouds/EaCCloudResourceFormatDetails.ts";

const kustoClientCache: Record<string, DataLakeServiceClient> = {};

export function loadDataLakeClient(
  account: string,
  creds: TokenCredential,
): Promise<DataLakeServiceClient>;

export function loadDataLakeClient(
  entLookup: string,
  cloudLookup: string,
  resGroupLookup: string,
  resLookups: string[],
  loadEaC: (entLookup: string) => Promise<EverythingAsCodeClouds>,
  svcSuffix?: string,
): Promise<DataLakeServiceClient>;

export async function loadDataLakeClient(
  accountEntLookup: string,
  credsCloudLookup: TokenCredential | string,
  resGroupLookup?: string,
  resLookups?: string[],
  loadEaC?: (entLookup: string) => Promise<EverythingAsCodeClouds>,
  svcSuffix?: string,
): Promise<DataLakeServiceClient> {
  let [account, creds] = [
    accountEntLookup,
    credsCloudLookup as TokenCredential,
  ];

  let svcClientUrl = "";

  if (typeof credsCloudLookup === "string") {
    svcClientUrl = `${accountEntLookup}|${credsCloudLookup as string}|${
      resLookups?.join("-")
    }`;
  } else {
    svcClientUrl = `https://${account}.dfs.core.windows.net`;
  }

  if (!(svcClientUrl in kustoClientCache)) {
    if (typeof credsCloudLookup === "string") {
      // Received enterprise lookup and cloud lookup to consruct
      const [entLookup, cloudLookup] = [
        accountEntLookup,
        credsCloudLookup as string,
      ];

      const eac = await loadEaC!(entLookup);

      creds = await loadAzureCloudCredentials(eac, cloudLookup);

      const cloud = eac.Clouds![cloudLookup];

      const resGroup = cloud.ResourceGroups![resGroupLookup!];

      const resource = resLookups?.reduce((prev, resLookup) => {
        const res = prev.Resources![resLookup];

        return res;
      }, resGroup as EaCCloudWithResources) as EaCCloudResourceAsCode;

      const resDetails = resource.Details! as EaCCloudResourceFormatDetails;

      const shortName = resDetails.Data!.ShortName as string;

      if (!svcSuffix) {
        svcSuffix = `datalake`;
      }

      account = `${shortName}${svcSuffix}`;

      svcClientUrl = `https://${account}.dfs.core.windows.net`;
    }

    kustoClientCache[svcClientUrl] = new DataLakeServiceClient(
      svcClientUrl,
      creds,
    );
  }

  return kustoClientCache[svcClientUrl];
}
