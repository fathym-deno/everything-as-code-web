import { EaCBaseClient } from "./EaCBaseClient.ts";

export class EaCDataLakeServiceClient extends EaCBaseClient {
  /** */
  constructor(protected baseUrl: URL, protected apiToken: string) {
    super(baseUrl, apiToken);
  }

  //#region API Methods
  public async Execute(
    entLookup: string,
    cloudLookup: string,
    resGroupLookup: string,
    resLookups: string[],
    fileSystem: string,
    resultType: "json" | "csv" | "jsonl",
    flatten?: boolean,
    download?: boolean,
  ): Promise<Response> {
    const res = resLookups.join("|");

    const resultTypeQuery = resultType ? `resultType=${resultType}` : undefined;

    const flattenQuery = flatten ? `flatten=${flatten}` : undefined;

    const downloadQuery = download ? `download=${download}` : undefined;

    const query = [resultTypeQuery, flattenQuery, downloadQuery]
      .filter((q) => q)
      .join("&");

    const response = await fetch(
      this.loadClientUrl(
        `${entLookup}/azure/${cloudLookup}/${resGroupLookup}/${res}/data-lake/${fileSystem}?${query}`,
      ),
      {
        method: "GET",
        headers: this.loadHeaders(),
      },
    );

    return response;
  }
  //#endregion

  //#region Helpers
  //#endregion
}
