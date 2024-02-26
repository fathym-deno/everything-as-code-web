import { sleep } from "../sleep.ts";
import { AtomicOperationHandler } from "./AtomicOperationHandler.ts";
import { DenoKVNonce } from "./DenoKVNonce.ts";

export async function hasKvEntry(
  denoKv: Deno.Kv,
  key: Deno.KvKey,
): Promise<boolean> {
  try {
    const entry = await denoKv.get(key);

    return !!entry?.value;
  } catch (err) {
    console.error(err);

    return false;
  }
}

export async function enqueueAtomic(
  denoKv: Deno.Kv,
  msg: DenoKVNonce,
  atomicOpHandler?: AtomicOperationHandler,
): Promise<Deno.KvCommitResult | Deno.KvCommitError> {
  msg.nonce = crypto.randomUUID();

  let op = enqueueAtomicOperation(denoKv.atomic(), msg);

  if (atomicOpHandler) {
    op = atomicOpHandler(op);
  }

  return await op.commit();
}

export function enqueueAtomicOperation(
  op: Deno.AtomicOperation,
  msg: DenoKVNonce,
  delay?: number,
): Deno.AtomicOperation {
  msg.nonce = crypto.randomUUID();

  op.check({ key: ["nonces", msg.nonce], versionstamp: null })
    .enqueue(msg, { delay })
    .set(["nonces", msg.nonce], true)
    .sum(["enqueued_count"], 1n);

  return op;
}

export async function listenQueueAtomic(
  denoKv: Deno.Kv,
  msg: DenoKVNonce,
  atomicOpHandler: AtomicOperationHandler,
) {
  if (!msg.nonce) {
    throw new Error(`The message is required to have a nonce value.`);
  }

  const nonce = await denoKv.get<DenoKVNonce>(["nonces", msg.nonce]);

  let atomic = denoKv
    .atomic()
    .check({ key: nonce.key, versionstamp: nonce.versionstamp })
    .delete(nonce.key)
    .sum(["processed_count"], 1n);

  atomic = atomicOpHandler(atomic);

  return await atomic.commit();
}

export async function waitOnProcessing<T>(
  denoKv: Deno.Kv,
  key: Deno.KvKey,
  msg: T,
  owner: string,
  handler: (msg: T) => Promise<void>,
  sleepFor = 250,
) {
  const processing = await denoKv.get<string>(key);

  if (processing.value && processing.value !== owner) {
    await sleep(sleepFor);

    await handler(msg);
  }

  await denoKv.set(key, owner);
}
