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
    totalDx: number;
    totalDy: number;
    ts: number;
}
export interface TrackpadSource {
    available(): Promise<boolean>;
    subscribe(listener: (gesture: TrackpadGesture) => void): Promise<() => void> | (() => void);
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
export declare function resolveReleaseSnap(input: ReleaseInput): number;
