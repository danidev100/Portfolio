/*
 * Ring rotation is in radians. Card `i` sits at angle `i * step`, so turning
 * the ring by `-i * step` brings it to the front.
 */

const FULL_TURN = Math.PI * 2;

/** How long a release keeps coasting, in seconds of its speed at that moment. */
const COAST_SECONDS = 0.25;

/** The cards at the sides stay faintly visible so the ring reads as a ring. */
const SIDE_OPACITY = 0.25;

function modulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

/** Angle between two neighboring cards. */
export function getStep(count: number): number {
  return FULL_TURN / count;
}

export function getFrontIndex(rotation: number, count: number): number {
  return modulo(Math.round(-rotation / getStep(count)), count);
}

/** Nearest rotation that leaves a card exactly in front. */
export function getSnapRotation(rotation: number, count: number): number {
  const step = getStep(count);

  return Math.round(rotation / step) * step;
}

/** Rotation that brings `index` to the front by the shortest way round. */
export function getRotationToIndex(rotation: number, index: number, count: number): number {
  const turn = -index * getStep(count) - rotation;
  const shortestTurn = modulo(turn + Math.PI, FULL_TURN) - Math.PI;

  return rotation + shortestTurn;
}

/** Rotation that brings the next (`1`) or previous (`-1`) card to the front. */
export function getNeighborRotation(rotation: number, direction: 1 | -1, count: number): number {
  return getSnapRotation(rotation, count) - direction * getStep(count);
}

/** Where the ring settles when released at `velocity` radians per second. */
export function getReleaseRotation(rotation: number, velocity: number, count: number): number {
  return getSnapRotation(rotation + velocity * COAST_SECONDS, count);
}

export function getCardOpacity(index: number, rotation: number, count: number): number {
  const facing = Math.cos(index * getStep(count) + rotation);

  return SIDE_OPACITY + (1 - SIDE_OPACITY) * Math.max(0, facing);
}
