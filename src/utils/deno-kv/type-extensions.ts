// import { DenoKVNonce } from "./DenoKVNonce.ts";
// import "./type-extensions.d.ts";

// Deno.AtomicOperation.prototype.enqueueNonce = function (
//   msg: DenoKVNonce,
// ): Deno.AtomicOperation {
//   msg.nonce = crypto.randomUUID();

//   this.check({ key: ["nonces", msg.nonce], versionstamp: null })
//     .enqueue(msg)
//     .set(["nonces", msg.nonce], true)
//     .sum(["enqueued_count"], 1n);

//   return this;
// };
