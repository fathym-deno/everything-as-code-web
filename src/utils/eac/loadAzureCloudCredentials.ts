import {
  EaCCloudAsCode,
  isEaCCloudAsCode,
} from "../../eac/modules/clouds/EaCCloudAsCode.ts";
import { EaCCloudAzureDetails } from "../../eac/modules/clouds/EaCCloudAzureDetails.ts";
import { EverythingAsCodeClouds } from "../../eac/modules/clouds/EverythingAsCodeClouds.ts";
import { ClientSecretCredential } from "npm:@azure/identity";
import { deconstructCloudDetailsSecrets } from "./helpers.ts";
import { EaCCloudDetails } from "../../eac/modules/clouds/EaCCloudDetails.ts";
import { EverythingAsCode } from "../../eac/EverythingAsCode.ts";

export async function loadAzureCloudCredentials(
  entLookup: string,
  cloudLookup: string,
  loadEac: (entLookup: string) => Promise<EverythingAsCode>,
): Promise<ClientSecretCredential>;

export async function loadAzureCloudCredentials(
  eac: EverythingAsCodeClouds,
  cloudLookup: string,
): Promise<ClientSecretCredential>;

export async function loadAzureCloudCredentials(
  cloud: EaCCloudAsCode,
): Promise<ClientSecretCredential>;

export async function loadAzureCloudCredentials(
  cloudDetails: EaCCloudDetails,
): Promise<ClientSecretCredential>;

export async function loadAzureCloudCredentials(
  cloudDetailsEaCEntLookup:
    | EverythingAsCodeClouds
    | EaCCloudAsCode
    | EaCCloudDetails
    | string,
  cloudLookup?: string,
  loadEaC?: (entLookup: string) => Promise<EverythingAsCode>,
): Promise<ClientSecretCredential> {
  let cloud: EaCCloudAsCode;

  if (cloudLookup) {
    let eac: EverythingAsCodeClouds;

    if (typeof cloudDetailsEaCEntLookup === "string") {
      eac = await loadEaC!(cloudDetailsEaCEntLookup);
    } else {
      eac = cloudDetailsEaCEntLookup as EverythingAsCodeClouds;
    }

    cloud = eac.Clouds![cloudLookup];
  } else if (isEaCCloudAsCode(cloudDetailsEaCEntLookup)) {
    cloud = cloudDetailsEaCEntLookup as EaCCloudAsCode;
  } else {
    cloud = {
      Details: cloudDetailsEaCEntLookup as EaCCloudDetails,
    };
  }

  const details = (await deconstructCloudDetailsSecrets(
    cloud.Details,
  )) as EaCCloudAzureDetails;

  return new ClientSecretCredential(
    details.TenantID,
    details.ApplicationID,
    details.AuthKey,
  );
}

export function loadMainAzureCredentials(): ClientSecretCredential {
  return new ClientSecretCredential(
    Deno.env.get("AZURE_TENANT_ID")!,
    Deno.env.get("AZURE_CLIENT_ID")!,
    Deno.env.get("AZURE_CLIENT_SECRET")!,
  );
}
