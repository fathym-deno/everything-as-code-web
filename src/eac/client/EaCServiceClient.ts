import { EverythingAsCode } from "../../eac/EverythingAsCode.ts";
import { UserEaCRecord } from "../../api/UserEaCRecord.ts";
import { EaCCommitResponse } from "../../api/models/EaCCommitResponse.ts";
import { EaCStatus } from "../../api/models/EaCStatus.ts";
import { EaCBaseClient } from "./EaCBaseClient.ts";
import { EaCStatusProcessingTypes } from "../../api/models/EaCStatusProcessingTypes.ts";

export class EaCServiceClient extends EaCBaseClient {
  /** */
  constructor(protected baseUrl: URL, protected apiToken: string) {
    super(baseUrl, apiToken);
  }

  //#region API Methods
  public async Commit<T extends EverythingAsCode>(
    eac: T,
    processingSeconds: number,
  ): Promise<EaCCommitResponse> {
    const response = await fetch(
      this.loadClientUrl(
        `${eac.EnterpriseLookup}?processingSeconds=${processingSeconds}`,
      ),
      {
        method: "POST",
        headers: this.loadHeaders(),
        body: JSON.stringify(eac),
      },
    );

    return await this.json(response);
  }

  public async Connections<T extends EverythingAsCode>(eac: T): Promise<T> {
    const response = await fetch(
      this.loadClientUrl(`${eac.EnterpriseLookup}/connections`),
      {
        method: "POST",
        headers: this.loadHeaders(),
        body: JSON.stringify(eac),
      },
    );

    return await this.json(response);
  }

  public async Create<T extends EverythingAsCode>(
    eac: T,
    username: string,
    processingSeconds: number,
  ): Promise<EaCCommitResponse> {
    const response = await fetch(
      this.loadClientUrl(
        `?processingSeconds=${processingSeconds}&username=${username}`,
      ),
      {
        method: "POST",
        headers: this.loadHeaders(),
        body: JSON.stringify(eac),
      },
    );

    return await this.json(response);
  }

  public async CurrentStatus(entLookup: string): Promise<EaCStatus> {
    const response = await fetch(
      this.loadClientUrl(`${entLookup}/status/current`),
      {
        headers: this.loadHeaders(),
      },
    );

    return await this.json(response);
  }

  public async Delete(
    eac: EverythingAsCode,
    archive: boolean,
    processingSeconds: number,
  ): Promise<EaCCommitResponse> {
    const response = await fetch(
      this.loadClientUrl(
        `${eac.EnterpriseLookup}?archive=${archive}&processingSeconds=${processingSeconds}`,
      ),
      {
        method: "DELETE",
        headers: this.loadHeaders(),
        body: JSON.stringify(eac),
      },
    );

    return await this.json(response);
  }

  public async Get<T extends EverythingAsCode>(entLookup: string): Promise<T> {
    const response = await fetch(this.loadClientUrl(`${entLookup}`), {
      headers: this.loadHeaders(),
    });

    return await this.json(response);
  }

  public async InviteUser(
    entLookup: string,
    userEaC: UserEaCRecord,
  ): Promise<EaCCommitResponse> {
    const response = await fetch(this.loadClientUrl(`${entLookup}/users`), {
      method: "POST",
      headers: this.loadHeaders(),
      body: JSON.stringify(userEaC),
    });

    return await this.json(response);
  }

  public async JWT(
    entLookup: string | undefined,
    username: string,
    expTime?: number,
  ): Promise<{
    Token: string;
  }> {
    const response = await fetch(
      this.loadClientUrl(
        `jwt?entLookup=${entLookup || ""}&username=${username}&expTime=${
          expTime || ""
        }`,
      ),
      {
        headers: this.loadHeaders(),
      },
    );

    return await this.json(response);
  }

  public async ListForUser(parentEntLookup?: string): Promise<UserEaCRecord[]> {
    const parentEntLookupQuery = parentEntLookup
      ? `parentEntLookup=${parentEntLookup}`
      : "";

    const response = await fetch(
      this.loadClientUrl(`list?${parentEntLookupQuery}`),
      {
        headers: this.loadHeaders(),
      },
    );

    return await this.json<UserEaCRecord[]>(response, []);
  }

  public async ListStati(
    entLookup: string,
    take?: number,
    statusTypes?: EaCStatusProcessingTypes[],
  ): Promise<EaCStatus[]> {
    const takeParam = take ? `take=${take}` : "";

    const statusTypeParams = statusTypes
      ?.map((st) => {
        return `statusType=${st}`;
      })
      .join("&") || "";

    const response = await fetch(
      this.loadClientUrl(
        `${entLookup}/status?${takeParam}&${statusTypeParams}`,
      ),
      {
        headers: this.loadHeaders(),
      },
    );

    return await this.json<EaCStatus[]>(response, []);
  }

  public async ListUsers(entLookup: string): Promise<UserEaCRecord[]> {
    const response = await fetch(this.loadClientUrl(`${entLookup}/users`), {
      headers: this.loadHeaders(),
    });

    return await this.json<UserEaCRecord[]>(response, []);
  }

  public async Status(entLookup: string, commitId: string): Promise<EaCStatus> {
    const response = await fetch(
      this.loadClientUrl(`${entLookup}/status/${commitId}`),
      {
        headers: this.loadHeaders(),
      },
    );

    return await this.json(response);
  }
  //#endregion

  //#region Helpers
  //#endregion
}
