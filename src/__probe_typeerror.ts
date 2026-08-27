// Temporary probe: deliberate type error to force Website CI (verify) to fail,
// so we can read whether a FAILING required check blocks merge. Never merged.
export const probeValue: number = "this is not a number";
