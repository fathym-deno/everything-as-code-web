import { UserEaCRecord } from "./UserEaCRecord.ts";
import { EaCAPIState } from "./EaCAPIState.ts";

export type EaCAPIUserState = EaCAPIState & {
  UserEaC?: UserEaCRecord;
};
