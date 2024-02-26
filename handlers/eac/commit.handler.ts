import { merge } from "@fathym/common";
import { denoKv } from "../../configs/deno-kv.config.ts";
import {
  enqueueAtomicOperation,
  listenQueueAtomic,
} from "../../src/utils/deno-kv/helpers.ts";
import { EaCCommitRequest } from "../../src/api/models/EaCCommitRequest.ts";
import {
  callEaCHandler,
  markEaCProcessed,
  waitOnEaCProcessing,
} from "../../src/utils/eac/helpers.ts";
import { UserEaCRecord } from "../../src/api/UserEaCRecord.ts";
import { EverythingAsCode } from "../../src/eac/EverythingAsCode.ts";
import { EaCStatus } from "../../src/api/models/EaCStatus.ts";
import { EaCStatusProcessingTypes } from "../../src/api/models/EaCStatusProcessingTypes.ts";
import { EaCMetadataBase } from "../../src/eac/EaCMetadataBase.ts";
import { EaCHandlerErrorResponse } from "../../src/api/models/EaCHandlerErrorResponse.ts";
import { EaCHandlerCheckRequest } from "../../src/api/models/EaCHandlerCheckRequest.ts";
import { EaCCommitCheckRequest } from "../../src/api/models/EaCCommitCheckRequest.ts";
import { eacHandlers } from "../../configs/eac-handlers.config.ts";
import { EaCHandler } from "../../src/eac/EaCHandler.ts";
import { AtomicOperationHandler } from "../../src/utils/deno-kv/AtomicOperationHandler.ts";

export async function handleEaCCommitRequest(commitReq: EaCCommitRequest) {
  console.log(`Processing EaC commit for ${commitReq.CommitID}`);

  if (!commitReq.EaC.EnterpriseLookup) {
    throw new Error("The enterprise lookup must be provided.");
  }

  if (commitReq.EaC.Details && !commitReq.EaC.Details!.Description) {
    commitReq.EaC.Details.Description = commitReq.EaC.Details.Name;
  }

  const { EnterpriseLookup, ParentEnterpriseLookup, Details, ...eacDiff } =
    commitReq.EaC;

  const statusKey = [
    "EaC",
    "Status",
    EnterpriseLookup,
    "ID",
    commitReq.CommitID,
  ];

  let status = await denoKv.get<EaCStatus>(statusKey);

  await waitOnEaCProcessing(
    denoKv,
    status.value!.EnterpriseLookup,
    status.value!.ID,
    commitReq,
    handleEaCCommitRequest,
    commitReq.ProcessingSeconds,
  );

  const existingEaC = await denoKv.get<EverythingAsCode>([
    "EaC",
    EnterpriseLookup,
  ]);

  let saveEaC: EverythingAsCode = existingEaC?.value! || {
    EnterpriseLookup,
    ParentEnterpriseLookup,
  };

  const diffKeys = Object.keys(eacDiff);

  if (Details) {
    saveEaC.Details = Details;
  }

  const errors: EaCHandlerErrorResponse[] = [];

  const allChecks: EaCHandlerCheckRequest[] = [];

  saveEaC = merge(saveEaC, eacDiff);

  saveEaC.Handlers = merge(eacHandlers, saveEaC.Handlers || {});

  delete saveEaC.Handlers!.Force;

  if (eacHandlers.Force) {
    delete eacHandlers.Force;

    const handlerKeys = Object.keys(eacHandlers);

    handlerKeys.forEach((key) => {
      saveEaC.Handlers![key]!.Order = eacHandlers[key]!.Order;
    });
  }

  const diffCalls: Record<number, (() => Promise<void>)[]> = {};

  let toProcess = { keys: [...diffKeys] };

  diffKeys.forEach(
    processDiffKey(
      eacDiff,
      saveEaC,
      commitReq,
      toProcess,
      allChecks,
      errors,
      diffCalls,
    ),
  );

  await processDiffCalls(diffCalls, allChecks, errors, status.value!);

  if (errors.length === 0 && allChecks.length === 0) {
    status.value!.Processing = EaCStatusProcessingTypes.COMPLETE;

    status.value!.EndTime = new Date();

    delete status.value!.Messages.Queued;
  }

  await listenQueueAtomic(
    denoKv,
    commitReq,
    configureListenQueueOp(
      existingEaC,
      status,
      EnterpriseLookup,
      commitReq,
      allChecks,
      errors,
      saveEaC,
      toProcess,
    ),
  );
}

function configureListenQueueOp(
  existingEaC: Deno.KvEntryMaybe<EverythingAsCode>,
  status: Deno.KvEntryMaybe<EaCStatus>,
  entLookup: string,
  commitReq: EaCCommitRequest,
  allChecks: EaCHandlerCheckRequest[],
  errors: EaCHandlerErrorResponse[],
  saveEaC: EverythingAsCode,
  toProcess: { keys: string[] },
): AtomicOperationHandler {
  return (op) => {
    op = op
      .check(existingEaC)
      .check(status)
      .set(
        ["EaC", "Status", entLookup, "ID", commitReq.CommitID],
        status.value,
      );

    if (commitReq.Username) {
      const userEaCRecord: UserEaCRecord = {
        EnterpriseLookup: entLookup,
        EnterpriseName: saveEaC.Details!.Name!,
        Owner: true,
        ParentEnterpriseLookup: saveEaC.ParentEnterpriseLookup!,
        Username: commitReq.Username,
      };

      op = op
        .set(["User", commitReq.Username, "EaC", entLookup], userEaCRecord)
        .set(["EaC", "Users", entLookup, commitReq.Username], userEaCRecord);
    }

    if (allChecks.length > 0) {
      const commitCheckReq: EaCCommitCheckRequest = {
        ...commitReq,
        Checks: allChecks,
        EaC: saveEaC,
        OriginalEaC: existingEaC?.value!,
        ToProcessKeys: toProcess.keys,
        nonce: undefined,
        versionstamp: undefined,
      };

      op = enqueueAtomicOperation(op, commitCheckReq, 1000 * 5);

      console.log(`Queuing EaC commit ${commitReq.CommitID} checks`);
    } else if (errors.length > 0) {
      op = markEaCProcessed(entLookup, op);

      console.log(`Processed EaC commit ${commitReq.CommitID} with errors`);
      console.log(errors);
    } else {
      op = markEaCProcessed(entLookup, op).set(["EaC", entLookup], saveEaC);

      console.log(`Processed EaC commit ${commitReq.CommitID}`);
    }

    return op;
  };
}

async function processDiffCalls(
  diffCalls: Record<number, (() => Promise<void>)[]>,
  allChecks: EaCHandlerCheckRequest[],
  errors: EaCHandlerErrorResponse[],
  status: EaCStatus,
): Promise<void> {
  const ordered = Object.keys(diffCalls)
    .map((k) => Number.parseInt(k))
    .sort((a, b) => {
      return a < b ? -1 : a > b ? 1 : 0;
    });

  for (const order of ordered) {
    console.log(
      `Processing EaC commit ${status.ID} diff calls (${
        diffCalls[order]?.length || 0
      }) for order '${order}'`,
    );

    await Promise.all(diffCalls[order].map((dc) => dc()));

    if (errors.length > 0) {
      status.Processing = EaCStatusProcessingTypes.ERROR;

      for (const error of errors) {
        status.Messages = merge(status.Messages, error.Messages);
      }

      status.EndTime = new Date();

      delete status.Messages.Queued;

      break;
    } else if (allChecks.length > 0) {
      status.Processing = EaCStatusProcessingTypes.PROCESSING;

      status.Messages.Queued = "Processing";

      break;
    }
  }
}

function processDiffKey(
  eacDiff: EverythingAsCode,
  saveEaC: EverythingAsCode,
  commitReq: EaCCommitRequest,
  toProcess: { keys: string[] },
  allChecks: EaCHandlerCheckRequest[],
  errors: EaCHandlerErrorResponse[],
  diffCalls: Record<number, (() => Promise<void>)[]>,
): (key: string) => void {
  return (key) => {
    console.log(
      `Preparing EaC commit ${commitReq.CommitID} to process key ${key}`,
    );

    const diff = eacDiff[key];

    if (diff) {
      const handler = saveEaC.Handlers![key];

      if (handler) {
        const process = processEaCHandler(
          diff,
          handler,
          commitReq,
          key,
          saveEaC,
          toProcess,
          allChecks,
          errors,
        );

        diffCalls[handler.Order] = [
          ...(diffCalls[handler.Order] || []),
          process,
        ];
      }
    }
  };
}

function processEaCHandler(
  diff: unknown,
  handler: EaCHandler,
  commitReq: EaCCommitRequest,
  key: string,
  saveEaC: EverythingAsCode,
  toProcess: { keys: string[] },
  allChecks: EaCHandlerCheckRequest[],
  errors: EaCHandlerErrorResponse[],
): () => Promise<void> {
  return async () => {
    console.log(`Processing EaC commit ${commitReq.CommitID} for key ${key}`);

    if (
      !Array.isArray(diff) &&
      typeof diff === "object" &&
      diff !== null &&
      diff !== undefined
    ) {
      const handled = await callEaCHandler(
        async (entLookup) => {
          const eac = await denoKv.get<EverythingAsCode>(["EaC", entLookup]);

          return eac.value!;
        },
        handler,
        commitReq,
        key,
        saveEaC,
        diff as EaCMetadataBase,
      );

      toProcess.keys = toProcess.keys.filter((k) => k !== key);

      allChecks.push(...(handled.Checks || []));

      saveEaC[key] = merge(saveEaC[key] || {}, handled.Result as object);

      errors.push(...handled.Errors);
    } else if (diff !== undefined) {
      saveEaC[key] = merge(saveEaC[key] || {}, diff || {});
    }
  };
}
