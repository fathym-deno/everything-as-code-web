import { ExplorerRequest } from "../../api/models/ExplorerRequest.ts";
import { EaCBaseClient } from "./EaCBaseClient.ts";
import { KustoResponseDataSet } from "npm:azure-kusto-data";

export class EaCExplorerServiceClient extends EaCBaseClient {
  /** */
  constructor(protected baseUrl: URL, protected apiToken: string) {
    super(baseUrl, apiToken);
  }

  //#region API Methods
  public async Query(
    entLookup: string,
    cloudLookup: string,
    resGroupLookup: string,
    resLookups: string[],
    db: string,
    request: ExplorerRequest,
  ): Promise<KustoResponseDataSet> {
    const res = resLookups.join("|");

    const response = await fetch(
      this.loadClientUrl(
        `${entLookup}/azure/${cloudLookup}/${resGroupLookup}/${res}/explorer/${db}`,
      ),
      {
        method: "POST",
        headers: this.loadHeaders(),
        body: JSON.stringify(request),
      },
    );

    return await this.json(response);
  }
  //#endregion

  //#region Helpers
  //#endregion
}
