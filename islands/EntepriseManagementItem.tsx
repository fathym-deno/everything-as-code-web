import { useRef } from "preact/hooks";
import { ActionGroup, Input } from "@fathym/atomic";
import { Action } from "@fathym/atomic";
import { ActionStyleTypes } from "@fathym/atomic";
import { BeginIcon } from "$fathym/atomic-icons";
import { DeleteIcon } from "$fathym/atomic-icons";
import { UserEaCRecord } from "../src/api/UserEaCRecord.ts";
import { JSX, Ref } from "preact";
import { EaCStatus } from "../src/api/models/EaCStatus.ts";
import { EaCStatusProcessingTypes } from "../src/api/models/EaCStatusProcessingTypes.ts";

export type EntepriseManagementItemProps = {
  active: boolean;

  enterprise: UserEaCRecord;
};

export function EntepriseManagementItem(props: EntepriseManagementItemProps) {
  const deleteEnterprise = (e: JSX.TargetedEvent<HTMLFormElement, Event>) => {
    e.preventDefault();

    if (
      confirm(
        `Are you sure you want to delete ${props.enterprise.EnterpriseName}?`,
      )
    ) {
      // deleteFormRef.
      fetch("", {
        method: "DELETE",
        body: JSON.stringify({
          EnterpriseLookup: props.enterprise.EnterpriseLookup,
        }),
      }).then((response) => {
        response.json().then((status: EaCStatus) => {
          if (status.Processing === EaCStatusProcessingTypes.COMPLETE) {
            location.reload();
          } else {
            console.log(status);
            alert(status.Messages["Error"]);
          }
        });
      });
    }
  };

  const setActiveEnterprise = (
    e: JSX.TargetedEvent<HTMLFormElement, Event>,
  ) => {
    e.preventDefault();

    if (
      confirm(
        `Are you sure you want to set ${props.enterprise.EnterpriseName} as active?`,
      )
    ) {
      // deleteFormRef.
      fetch("", {
        method: "PUT",
        body: JSON.stringify({
          EnterpriseLookup: props.enterprise.EnterpriseLookup,
        }),
      }).then((response) => {
        response.json().then((status: EaCStatus) => {
          if (status.Processing === EaCStatusProcessingTypes.COMPLETE) {
            location.reload();
          } else {
            console.log(status);
            alert(status.Messages["Error"]);
          }
        });
      });
    }
  };

  return (
    <div class="flex flex-row justify-center items-center hover:bg-slate-300 hover:opactity-80">
      <h1 class="flex-1 text-lg ml-1">{props.enterprise.EnterpriseName}</h1>

      <ActionGroup class="flex-none">
        <>
          {!props.active && (
            <form onSubmit={(e) => setActiveEnterprise(e)}>
              <Action actionStyle={ActionStyleTypes.Link}>
                <BeginIcon class="w-6 h-6 text-sky-500" />
              </Action>
            </form>
          )}

          <form onSubmit={(e) => deleteEnterprise(e)}>
            <Action type="submit" actionStyle={ActionStyleTypes.Link}>
              <DeleteIcon class="w-6 h-6 text-red-500" />
            </Action>
          </form>
        </>
      </ActionGroup>
    </div>
  );
}
