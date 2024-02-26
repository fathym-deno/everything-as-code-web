// deno-lint-ignore-file no-explicit-any
import { FreshContext, Handlers } from "$fresh/server.ts";
import { STATUS_CODE } from "$std/http/status.ts";
import { respond } from "@fathym/common";
import { EaCAPIUserState } from "../../../../src/api/EaCAPIUserState.ts";
import { UserEaCRecord } from "../../../../src/api/UserEaCRecord.ts";
import { denoKv } from "../../../../configs/deno-kv.config.ts";
import { EverythingAsCode } from "../../../../src/eac/EverythingAsCode.ts";

export const handler: Handlers = {
  /**
   * Use this endpoint to list an EaC's users with access.
   * @param _req
   * @param ctx
   * @returns
   */
  async GET(_req: Request, ctx: FreshContext<any, EaCAPIUserState>) {
    const entLookup = ctx.state.UserEaC!.EnterpriseLookup;

    const eacUserResults = await denoKv.list<UserEaCRecord>({
      prefix: ["EaC", "Users", entLookup],
    });

    const userEaCRecords: UserEaCRecord[] = [];

    for await (const userEaCRecord of eacUserResults) {
      userEaCRecords.push(userEaCRecord.value);
    }

    return respond(userEaCRecords);
  },

  /**
   * Use this endpoint to invite a user to an EaC container.
   * @param _req
   * @param _ctx
   * @returns
   */
  async POST(req, ctx: FreshContext<any, EaCAPIUserState>) {
    const entLookup = ctx.state.UserEaC!.EnterpriseLookup;

    const userEaCRecord = (await req.json()) as UserEaCRecord;

    userEaCRecord.EnterpriseLookup = entLookup;

    if (!userEaCRecord.EnterpriseLookup) {
      return respond(
        {
          Message: "The enterprise lookup must be provided.",
        },
        {
          status: STATUS_CODE.BadRequest,
        },
      );
    }

    if (!userEaCRecord.Username) {
      return respond(
        {
          Message: "The username must be provided.",
        },
        {
          status: STATUS_CODE.BadRequest,
        },
      );
    }

    const existingEaC = await denoKv.get<EverythingAsCode>(["EaC", entLookup]);

    if (!existingEaC.value) {
      return respond(
        {
          Message:
            "The enterprise must first be created before a user can be invited.",
        },
        {
          status: STATUS_CODE.BadRequest,
        },
      );
    }

    userEaCRecord.EnterpriseName = existingEaC.value.Details!.Name!;

    userEaCRecord.ParentEnterpriseLookup = existingEaC.value
      .ParentEnterpriseLookup!;

    await denoKv
      .atomic()
      .set(["User", userEaCRecord.Username, "EaC", entLookup], userEaCRecord)
      .set(["EaC", "Users", entLookup, userEaCRecord.Username], userEaCRecord)
      .commit();

    //  TODO: Send user invite email

    return respond({
      Message:
        `The user '${userEaCRecord.Username}' has been invited to enterprise '${userEaCRecord.EnterpriseLookup}'.`,
    });
  },
};
