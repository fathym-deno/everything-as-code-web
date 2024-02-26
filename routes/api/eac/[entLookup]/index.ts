// deno-lint-ignore-file no-explicit-any
import { FreshContext, Handlers } from "$fresh/server.ts";
import { STATUS_CODE } from "$std/http/status.ts";
import { respond } from "@fathym/common";
import { EaCAPIUserState } from "../../../../src/api/EaCAPIUserState.ts";
import { EverythingAsCode } from "../../../../src/eac/EverythingAsCode.ts";
import { denoKv } from "../../../../configs/deno-kv.config.ts";
import { EaCStatus } from "../../../../src/api/models/EaCStatus.ts";
import { EaCStatusProcessingTypes } from "../../../../src/api/models/EaCStatusProcessingTypes.ts";
import { EaCCommitRequest } from "../../../../src/api/models/EaCCommitRequest.ts";
import { eacExists } from "../../../../src/utils/eac/helpers.ts";
import { enqueueAtomic } from "../../../../src/utils/deno-kv/helpers.ts";
import { EaCCommitResponse } from "../../../../src/api/models/EaCCommitResponse.ts";
import { EaCDeleteRequest } from "../../../../src/api/models/EaCDeleteRequest.ts";

export const handler: Handlers = {
  /**
   * Use this endpoint to get a user's EaC.
   * @param _req
   * @param ctx
   * @returns
   */
  async GET(_req, ctx: HandlerContext<any, EaCAPIUserState>) {
    const entLookup = ctx.state.UserEaC!.EnterpriseLookup;

    const eac = await denoKv.get<EverythingAsCode>(["EaC", entLookup]);

    return respond(eac.value || {});
  },

  /**
   * Use this endpoint to commit update changes to an EaC container.
   * @param _req
   * @param _ctx
   * @returns
   */
  async POST(req, ctx: FreshContext<any, EaCAPIUserState>) {
    const entLookup = ctx.state.UserEaC!.EnterpriseLookup;

    const username = ctx.state.Username;

    const url = new URL(req.url);

    const processingSeconds = Number.parseInt(
      url.searchParams.get("processingSeconds")!,
    );

    const eac = (await req.json()) as EverythingAsCode;

    const commitStatus: EaCStatus = {
      ID: crypto.randomUUID(),
      EnterpriseLookup: entLookup,
      Messages: { Queued: "Commiting existing EaC container" },
      Processing: EaCStatusProcessingTypes.QUEUED,
      StartTime: new Date(Date.now()),
      Username: username!,
    };

    console.log(
      `Updating EaC container for ${eac.EnterpriseLookup} with Commit ID ${commitStatus.ID}.`,
    );

    const commitReq: EaCCommitRequest = {
      CommitID: commitStatus.ID,
      EaC: {
        ...(eac || {}),
        EnterpriseLookup: commitStatus.EnterpriseLookup,
      },
      JWT: ctx.state.JWT!,
      ProcessingSeconds: processingSeconds,
      Username: "",
    };

    if (!commitReq.EaC.EnterpriseLookup) {
      return respond(
        {
          Message: "The enterprise lookup must be provided.",
        },
        {
          status: STATUS_CODE.BadRequest,
        },
      );
    }

    if (!(await eacExists(denoKv, commitReq.EaC.EnterpriseLookup))) {
      return respond(
        {
          Message:
            "The enterprise must first be created before it can be updated.",
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
            commitStatus.EnterpriseLookup,
            "ID",
            commitStatus.ID,
          ],
          commitStatus,
        )
        .set(
          ["EaC", "Status", commitStatus.EnterpriseLookup, "EaC"],
          commitStatus,
        );
    });

    console.log(
      `EaC container update for ${eac.EnterpriseLookup} queued with Commit ID ${commitStatus.ID}.`,
    );

    return respond({
      CommitID: commitStatus.ID,
      EnterpriseLookup: commitStatus.EnterpriseLookup,
      Message:
        `The enterprise '${commitReq.EaC.EnterpriseLookup}' commit has been queued.`,
    } as EaCCommitResponse);
  },

  /**
   * Use this endpoint to execute a set of delete operations or archive an entire EaC container.
   * @param _req
   * @param _ctx
   * @returns
   */
  async DELETE(req, ctx: HandlerContext<any, EaCAPIUserState>) {
    const entLookup = ctx.state.UserEaC!.EnterpriseLookup;

    const username = ctx.state.Username!;

    const eac = (await req.json()) as EverythingAsCode;

    const url = new URL(req.url);

    const processingSeconds = Number.parseInt(
      url.searchParams.get("processingSeconds")!,
    );

    const commitStatus: EaCStatus = {
      ID: crypto.randomUUID(),
      EnterpriseLookup: entLookup!,
      Messages: { Queued: "Deleting existing EaC container" },
      Processing: EaCStatusProcessingTypes.QUEUED,
      StartTime: new Date(Date.now()),
      Username: username!,
    };

    const deleteReq: EaCDeleteRequest = {
      Archive: JSON.parse(
        url.searchParams.get("archive") || "false",
      ) as boolean,
      CommitID: commitStatus.ID,
      EaC: {
        ...eac,
        EnterpriseLookup: entLookup,
      },
      JWT: ctx.state.JWT!,
      ProcessingSeconds: processingSeconds,
      Username: username,
    };

    if (!deleteReq.EaC.EnterpriseLookup) {
      return respond(
        {
          Message: "The enterprise lookup must be provided.",
        },
        {
          status: STATUS_CODE.BadRequest,
        },
      );
    }

    if (!(await eacExists(denoKv, deleteReq.EaC.EnterpriseLookup))) {
      return respond(
        {
          Message: `The enterprise must first be created before it can ${
            deleteReq.Archive ? " be archived" : "execute delete operations"
          }.`,
        },
        {
          status: STATUS_CODE.BadRequest,
        },
      );
    }

    await enqueueAtomic(denoKv, deleteReq, (op) => {
      return op
        .set(
          [
            "EaC",
            "Status",
            commitStatus.EnterpriseLookup,
            "ID",
            commitStatus.ID,
          ],
          commitStatus,
        )
        .set(
          ["EaC", "Status", commitStatus.EnterpriseLookup, "EaC"],
          commitStatus,
        );
    });

    return respond({
      CommitID: commitStatus.ID,
      EnterpriseLookup: commitStatus.EnterpriseLookup,
      Message: `The enterprise '${deleteReq.EaC.EnterpriseLookup}' ${
        deleteReq.Archive ? "archiving" : "delete operations"
      } have been queued.`,
    } as EaCCommitResponse);
  },
};
