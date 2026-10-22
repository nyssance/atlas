export type RegionId = string;
export interface AtlasState {
  readonly activeRegion: RegionId | null;
  readonly visibleRegions: readonly RegionId[];
  readonly moving: boolean;
}
export interface TrackpadGesture {
  fingers: number;
  phase: "began" | "changed" | "ended" | "cancelled";
  dx: number;
  dy: number;
}
export interface TrackpadSource {
  available(): Promise<boolean>;
  subscribe(
    listener: (gesture: TrackpadGesture) => void,
  ): Promise<() => void> | (() => void);
}
export interface ReleaseInput {
  startIndex: number;
  displacement: number;
  location: number;
  snapPoints: readonly number[];
  viewportWidth: number;
  flickMinIndex?: number;
}
/** Desktop release policy: nearest region first, then a 15% one-region flick.
 * Negative-screen drawers can opt out of flick entry with flickMinIndex. */
export function resolveReleaseSnap(input: ReleaseInput): number {
  const {
    startIndex,
    displacement,
    location,
    snapPoints,
    viewportWidth,
    flickMinIndex = 0,
  } = input;
  if (!snapPoints.length)
    throw new Error("Atlas requires at least one snap point");
  if (snapPoints.length === 1) return 0;
  let nearest = 0;
  for (let i = 1; i < snapPoints.length; i++)
    if (
      Math.abs(snapPoints[i] - location) <
      Math.abs(snapPoints[nearest] - location)
    )
      nearest = i;
  if (nearest !== startIndex) return nearest;
  if (Math.abs(displacement) < viewportWidth * 0.15) return startIndex;
  const direction =
    startIndex < snapPoints.length - 1
      ? snapPoints[startIndex + 1] - snapPoints[startIndex]
      : snapPoints[startIndex] - snapPoints[startIndex - 1];
  const target = startIndex + (displacement * direction > 0 ? 1 : -1);
  return target < flickMinIndex
    ? startIndex
    : Math.max(0, Math.min(target, snapPoints.length - 1));
}
