import { Location } from "npm:@azure/arm-subscriptions";
import { EaCBaseClient } from "./EaCBaseClient.ts";
import { EaCServiceDefinitions } from "../../api/models/EaCServiceDefinitions.ts";

export class EaCAzureServiceClient extends EaCBaseClient {
  /** */
  constructor(protected baseUrl: URL, protected apiToken: string) {
    super(baseUrl, apiToken);
  }

  //#region API Methods
  public async CloudAPIVersions(
    entLookup: string,
    cloudLookup: string,
    svcDefs: EaCServiceDefinitions,
  ): Promise<Record<string, string>> {
    const response = await fetch(
      this.loadClientUrl(`${entLookup}/azure/${cloudLookup}/api-versions`),
      {
        method: "POST",
        headers: this.loadHeaders(),
        body: JSON.stringify(svcDefs),
      },
    );

    return await this.json(response);
  }

  public async CloudAuthToken(
    entLookup: string,
    cloudLookup: string,
    scopes: string[],
  ): Promise<string> {
    const response = await fetch(
      this.loadClientUrl(
        `${entLookup}/azure/${cloudLookup}/auth-token?scope=${
          scopes.join(",")
        }`,
      ),
      {
        method: "GET",
        headers: this.loadHeaders(),
      },
    );

    return await this.json(response, "");
  }

  public async CloudEnsureProviders(
    entLookup: string,
    cloudLookup: string,
    svcDefs: EaCServiceDefinitions,
  ): Promise<{
    Locations: Location[];
  }> {
    const response = await fetch(
      this.loadClientUrl(`${entLookup}/azure/${cloudLookup}/providers`),
      {
        method: "POST",
        headers: this.loadHeaders(),
        body: JSON.stringify(svcDefs),
      },
    );

    return await this.json(response);
  }

  public async CloudLocations(
    entLookup: string,
    cloudLookup: string,
    svcDefs: EaCServiceDefinitions,
  ): Promise<{
    Locations: Location[];
  }> {
    const response = await fetch(
      this.loadClientUrl(`${entLookup}/azure/${cloudLookup}/locations`),
      {
        method: "POST",
        headers: this.loadHeaders(),
        body: JSON.stringify(svcDefs),
      },
    );

    return await this.json(response);
  }
  //#endregion

  //#region Helpers
  //#endregion
}
