import { isEaCCommitCheckRequest } from "../api/models/EaCCommitCheckRequest.ts";
import { handleEaCCommitCheckRequest } from "../../handlers/eac/commit-check.handler.ts";
import { denoKv } from "../../configs/deno-kv.config.ts";
import { isEaCCommitRequest } from "../api/models/EaCCommitRequest.ts";
import { handleEaCCommitRequest } from "../../handlers/eac/commit.handler.ts";
import { isEaCDeleteRequest } from "../api/models/EaCDeleteRequest.ts";
import { handleEaCDeleteRequest } from "../../handlers/eac/delete.handler.ts";

if (!Deno.args.includes("build")) {
  /**
   * This listener set is responsible for the core EaC actions.
   */
  denoKv.listenQueue(async (msg: unknown) => {
    const trackingKey = ["Handlers", "Commits", "Processing"];

    if (isEaCCommitCheckRequest(msg)) {
      console.log(
        `Queue message picked up for processing commit checks ${msg.CommitID}`,
      );

      trackingKey.push("Checks");
      trackingKey.push(msg.CommitID);
    } else if (isEaCDeleteRequest(msg)) {
      console.log(
        `Queue message picked up for processing commit delete ${msg.CommitID}`,
      );

      trackingKey.push("Delete");
      trackingKey.push(msg.CommitID);
    } else if (isEaCCommitRequest(msg)) {
      console.log(
        `Queue message picked up for processing commit ${msg.CommitID}`,
      );

      trackingKey.push("Commit");
      trackingKey.push(msg.CommitID);
    }

    try {
      const isCommitting = await denoKv.get<boolean>(trackingKey);

      if (!isCommitting.value) {
        await denoKv.set(trackingKey, true);

        if (isEaCCommitCheckRequest(msg)) {
          await handleEaCCommitCheckRequest(msg);
        } else if (isEaCDeleteRequest(msg)) {
          await handleEaCDeleteRequest(msg);
        } else if (isEaCCommitRequest(msg)) {
          await handleEaCCommitRequest(msg);
        }
      } else {
        console.log(
          `The commit ${
            (msg as { CommitID: string }).CommitID
          } is already processing.`,
        );
      }
    } finally {
      await denoKv.delete(trackingKey);

      console.log(
        `The commit ${
          (msg as { CommitID: string }).CommitID
        } completed processing.`,
      );
    }
  });
}
