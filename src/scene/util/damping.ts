import type { Vec3 } from './scenePanel';

/** Below this distance (in world units) a movement is no longer visible. */
export const SETTLE_EPSILON = 0.001;

/**
 * The scene only renders when something changes, so the first frame after an
 * idle period reports the whole idle time as its delta. This caps the jump.
 */
export const MAX_FRAME_DELTA_S = 0.05;

export function clampFrameDelta(deltaSeconds: number): number {
  return Math.min(deltaSeconds, MAX_FRAME_DELTA_S);
}

/**
 * Share of the remaining distance to cover this frame. Exponential, so the
 * motion looks the same at any frame rate.
 */
export function getDampingFactor(lambda: number, deltaSeconds: number): number {
  return 1 - Math.exp(-lambda * deltaSeconds);
}

export function isSettled(current: Vec3, target: Vec3): boolean {
  return (
    Math.hypot(current[0] - target[0], current[1] - target[1], current[2] - target[2]) <
    SETTLE_EPSILON
  );
}
