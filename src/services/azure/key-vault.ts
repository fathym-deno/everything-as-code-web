import { KeyClient } from "npm:@azure/keyvault-keys";
import { SecretClient } from "npm:@azure/keyvault-secrets";
import { TokenCredential } from "npm:@azure/identity";
import {
  loadAzureCloudCredentials,
  loadMainAzureCredentials,
} from "../../utils/eac/loadAzureCloudCredentials.ts";
import {
  EverythingAsCodeClouds,
  isEverythingAsCodeClouds,
} from "../../eac/modules/clouds/EverythingAsCodeClouds.ts";

export async function loadKeyClient(
  eac: EverythingAsCodeClouds,
  cloudLookup: string,
  keyVaultLookup: string,
): Promise<KeyClient>;

export async function loadKeyClient(
  creds: TokenCredential,
  keyVaultLookup: string,
): Promise<KeyClient>;

export async function loadKeyClient(
  credsEaC: TokenCredential | EverythingAsCodeClouds,
  keyVaultCloudLookup: string,
  keyVaultLookup?: string,
): Promise<KeyClient> {
  const { creds, url } = await loadKeyVaultUrlAndCreds(
    credsEaC,
    keyVaultCloudLookup,
    keyVaultLookup,
  );

  return new KeyClient(url, creds);
}

export async function loadMainKeyClient(
  keyVaultLookup: string,
): Promise<KeyClient> {
  const creds = loadMainAzureCredentials();

  return await loadKeyClient(creds, keyVaultLookup);
}

export async function loadSecretClient(
  eac: EverythingAsCodeClouds,
  cloudLookup: string,
  keyVaultLookup: string,
): Promise<SecretClient>;

export async function loadSecretClient(
  creds: TokenCredential,
  keyVaultLookup: string,
): Promise<SecretClient>;

export async function loadSecretClient(
  credsEaC: TokenCredential | EverythingAsCodeClouds,
  keyVaultCloudLookup: string,
  keyVaultLookup?: string,
): Promise<SecretClient> {
  const { creds, url } = await loadKeyVaultUrlAndCreds(
    credsEaC,
    keyVaultCloudLookup,
    keyVaultLookup,
  );

  return new SecretClient(url, creds);
}

export async function loadMainSecretClient(): Promise<SecretClient>;

export async function loadMainSecretClient(
  keyVaultLookup?: string,
): Promise<SecretClient> {
  if (!keyVaultLookup) {
    keyVaultLookup = Deno.env.get("AZURE_KEY_VAULT_NAME")!;
  }

  const creds = loadMainAzureCredentials();

  return await loadSecretClient(creds, keyVaultLookup);
}

export async function loadKeyVaultUrlAndCreds(
  credsEaC: TokenCredential | EverythingAsCodeClouds,
  keyVaultCloudLookup: string,
  keyVaultLookup?: string,
): Promise<{
  creds: TokenCredential;

  url: string;
}> {
  let creds: TokenCredential | undefined;

  if (isEverythingAsCodeClouds(credsEaC)) {
    creds = await loadAzureCloudCredentials(
      credsEaC,
      keyVaultCloudLookup,
    );
  } else {
    creds = credsEaC;
  }

  if (!keyVaultLookup) {
    keyVaultLookup = keyVaultCloudLookup;
  }

  const url = `https://${keyVaultLookup}.vault.azure.net/`;

  return { creds, url };
}
