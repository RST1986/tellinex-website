// Temporary probe: deliberate type error to force Website CI (verify) to FAIL,
// so we can read whether a failing required check blocks merge. Never merged.
export const probeValue: number = "this is not a number";
