// deno-lint-ignore-file no-explicit-any
import { STATUS_CODE } from "$std/http/status.ts";
import { HandlerContext, Handlers } from "$fresh/server.ts";
import { respond } from "@fathym/common";
import { EaCAPIState } from "../../../src/api/EaCAPIState.ts";
import { UserEaCRecord } from "../../../src/api/UserEaCRecord.ts";
import { denoKv, fathymDenoKv } from "../../../configs/deno-kv.config.ts";
import { EaCStatus } from "../../../src/api/models/EaCStatus.ts";
import { EaCStatusProcessingTypes } from "../../../src/api/models/EaCStatusProcessingTypes.ts";
import { eacExists } from "../../../src/utils/eac/helpers.ts";
import { EaCCommitRequest } from "../../../src/api/models/EaCCommitRequest.ts";
import { enqueueAtomic } from "../../../src/utils/deno-kv/helpers.ts";
import { EaCCommitResponse } from "../../../src/api/models/EaCCommitResponse.ts";
import { EverythingAsCode } from "../../../src/eac/EverythingAsCode.ts";

export const handler: Handlers = {
  /**
   * Use this endpoint to commit a new EaC container.
   * @param _req
   * @param _ctx
   * @returns
   */
  async POST(req, ctx: HandlerContext<any, EaCAPIState>) {
    const url = new URL(req.url);

    const username = url.searchParams.get("username")!;

    const processingSeconds = Number.parseInt(
      url.searchParams.get("processingSeconds")!,
    );

    const eac: EverythingAsCode = await req.json();

    const createStatus: EaCStatus = {
      ID: crypto.randomUUID(),
      EnterpriseLookup: eac.EnterpriseLookup || crypto.randomUUID(),
      Messages: { Queued: "Creating new EaC container" },
      Processing: EaCStatusProcessingTypes.QUEUED,
      StartTime: new Date(Date.now()),
      Username: username,
    };

    console.log(
      `Create EaC container for ${eac.EnterpriseLookup} with Commit ID ${createStatus.ID} for user ${createStatus.Username}.`,
    );

    while (await eacExists(denoKv, createStatus.EnterpriseLookup)) {
      createStatus.EnterpriseLookup = crypto.randomUUID();
    }

    const commitReq: EaCCommitRequest = {
      CommitID: createStatus.ID,
      EaC: {
        ...(eac || {}),
        EnterpriseLookup: createStatus.EnterpriseLookup,
        ParentEnterpriseLookup: ctx.state.EnterpriseLookup,
      },
      JWT: ctx.state.JWT!,
      ProcessingSeconds: processingSeconds,
      Username: username,
    };

    if (!commitReq.EaC.EnterpriseLookup) {
      return respond(
        {
          Message: "There was an issue creating a new EaC container.",
        },
        {
          status: STATUS_CODE.BadRequest,
        },
      );
    }

    if (!commitReq.EaC.Details?.Name) {
      return respond(
        {
          Message:
            "The name must be provided when creating a new EaC container.",
        },
        {
          status: STATUS_CODE.BadRequest,
        },
      );
    }

    await enqueueAtomic(denoKv, commitReq, (op) => {
      return op
        .set(
          [
            "EaC",
            "Status",
            createStatus.EnterpriseLookup,
            "ID",
            createStatus.ID,
          ],
          createStatus,
        )
        .set(
          ["EaC", "Status", createStatus.EnterpriseLookup, "EaC"],
          createStatus,
        );
    });

    console.log(
      `EaC container creation for ${eac.EnterpriseLookup} queued with Commit ID ${createStatus.ID}.`,
    );

    return respond({
      CommitID: createStatus.ID,
      EnterpriseLookup: createStatus.EnterpriseLookup,
      Message:
        `The enterprise '${createStatus.EnterpriseLookup}' commit has been queued.`,
    } as EaCCommitResponse);
  },
};
