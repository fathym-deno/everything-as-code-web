import { Handlers, PageProps } from "$fresh/server.ts";
import {
  Action,
  ActionGroup,
  ActionStyleTypes,
  EaCManageForm,
} from "@fathym/atomic";
import { BeginIcon, DeleteIcon } from "$fathym/atomic-icons";
import { UserEaCRecord } from "../../../src/api/UserEaCRecord.ts";
import { EverythingAsCodeState } from "../../../src/eac/EverythingAsCodeState.ts";
import { loadEaCSvc } from "../../../configs/eac.ts";
import { FathymEaC } from "../../../src/FathymEaC.ts";
import {
  waitForStatus,
  waitForStatusWithFreshJwt,
} from "../../../src/utils/eac/waitForStatus.ts";
import { EaCStatusProcessingTypes } from "../../../src/api/models/EaCStatusProcessingTypes.ts";
import { denoKv, fathymDenoKv } from "../../../configs/deno-kv.config.ts";
import { redirectRequest, respond } from "@fathym/common";
import { EntepriseManagementItem } from "../../../islands/EntepriseManagementItem.tsx";
import { EaCStatus } from "../../../src/api/models/EaCStatus.ts";
import { EverythingAsCode } from "../../../src/eac/EverythingAsCode.ts";

type EnterprisePageData = {
  currentEaC?: FathymEaC;

  enterprises: UserEaCRecord[];
};

export const handler: Handlers<EnterprisePageData, EverythingAsCodeState> = {
  async GET(_req, ctx) {
    const data: EnterprisePageData = {
      currentEaC: ctx.state.EaC,
      enterprises: [],
    };

    if (ctx.state.EaC) {
      const eacSvc = await loadEaCSvc(
        ctx.state.EaC?.EnterpriseLookup!,
        ctx.state.Username!,
      );

      data.enterprises = await eacSvc.ListForUser();
    }

    return ctx.render(data);
  },

  async POST(req, ctx) {
    const formData = await req.formData();

    const newEaC: FathymEaC = {
      EnterpriseLookup: ctx.state.EaC?.EnterpriseLookup || crypto.randomUUID(),
      Details: {
        Name: formData.get("name") as string,
        Description: formData.get("description") as string,
      },
    };

    const eacSvc = await loadEaCSvc(
      newEaC.EnterpriseLookup!,
      ctx.state.Username!,
    );

    const createResp = await eacSvc.Create(newEaC, ctx.state.Username!, 60);

    const status = await waitForStatusWithFreshJwt(
      eacSvc,
      createResp.EnterpriseLookup,
      createResp.CommitID,
      ctx.state.Username!,
    );

    if (status.Processing == EaCStatusProcessingTypes.COMPLETE) {
      await fathymDenoKv.set(
        ["User", ctx.state.Username!, "Current", "EaC"],
        createResp.EnterpriseLookup,
      );

      return redirectRequest("/dashboard");
    } else {
      return redirectRequest(
        `/dashboard?error=${
          encodeURIComponent(
            status.Messages["Error"] as string,
          )
        }&commitId=${createResp.CommitID}`,
      );
    }
  },

  async PUT(req, ctx) {
    const eac: EverythingAsCode = await req.json();

    await fathymDenoKv.set(
      ["User", ctx.state.Username!, "Current", "EaC"],
      eac.EnterpriseLookup,
    );

    return respond({ Processing: EaCStatusProcessingTypes.COMPLETE });
  },

  async DELETE(req, ctx) {
    const eac: EverythingAsCode = await req.json();

    const eacSvc = await loadEaCSvc(eac.EnterpriseLookup!, ctx.state.Username!);

    const deleteResp = await eacSvc.Delete(eac, true, 60);

    const status = await waitForStatus(
      eacSvc,
      eac.EnterpriseLookup!,
      deleteResp.CommitID,
    );

    return respond(status);
  },
};

export default function Enterprise({
  data,
}: PageProps<EnterprisePageData, EverythingAsCodeState>) {
  return (
    <>
      <EaCManageForm action="" />

      <div class="max-w-sm m-auto">
        <div class="border-b-[1px] border-dotted border-slate-400 dark:border-slate-700">
        </div>

        {data.enterprises &&
          data.enterprises.map((enterprise) => {
            return (
              <EntepriseManagementItem
                active={data.currentEaC?.EnterpriseLookup ===
                  enterprise.EnterpriseLookup}
                enterprise={enterprise}
              />
            );
          })}
      </div>
    </>
  );
}
