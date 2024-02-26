import { loadEaCSvc } from "../../../configs/eac.ts";
import { EaCStatus } from "../../api/models/EaCStatus.ts";
import { EaCStatusProcessingTypes } from "../../api/models/EaCStatusProcessingTypes.ts";
import { EaCServiceClient } from "../../eac/client/EaCServiceClient.ts";
import { sleep } from "../sleep.ts";

export async function waitForStatus(
  eacSvc: EaCServiceClient,
  entLookup: string,
  commitId: string,
  sleepFor = 400,
): Promise<EaCStatus> {
  return await withStatusCheck(async () => {
    return await eacSvc.Status(entLookup, commitId);
  }, sleepFor);
}

export async function waitForStatusWithFreshJwt(
  parentEaCSvc: EaCServiceClient,
  entLookup: string,
  commitId: string,
  username: string,
  sleepFor = 400,
): Promise<EaCStatus> {
  return await withStatusCheck(async () => {
    const eacJwt = await parentEaCSvc.JWT(entLookup, username);

    if (!eacJwt.Token) {
      return null;
    }
    const eacSvc = await loadEaCSvc(eacJwt.Token);

    return await eacSvc.Status(entLookup, commitId);
  }, sleepFor);
}

export async function withStatusCheck(
  action: () => Promise<EaCStatus | null>,
  sleepFor = 400,
): Promise<EaCStatus> {
  let status: EaCStatus | null = null;

  do {
    status = (await action()) || status;

    await sleep(sleepFor);
  } while (
    status?.Processing != EaCStatusProcessingTypes.COMPLETE &&
    status?.Processing != EaCStatusProcessingTypes.ERROR
  );

  return status;
}
