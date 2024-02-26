export type AtomicOperationHandler = (
  atomic: Deno.AtomicOperation,
) => Deno.AtomicOperation;
