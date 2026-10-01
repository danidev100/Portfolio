export interface ParticleField {
  count: number;
  seed: number;
}

/** The field sits behind the panels, which live around z = 0. */
export const PARTICLE_BOUNDS = { halfWidth: 13, halfHeight: 7, nearZ: -4, farZ: -14 } as const;

const UINT32_RANGE = 2 ** 32;

/**
 * Seeded generator (mulberry32). `Math.random` would give a different field on
 * every render and make the scene impossible to test.
 */
function createRandom(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = Math.imul(state ^ (state >>> 15), state | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);

    return ((mixed ^ (mixed >>> 14)) >>> 0) / UINT32_RANGE;
  };
}

/** Flat `[x, y, z, x, y, z, …]` array, ready for a position buffer attribute. */
export function createParticlePositions({ count, seed }: ParticleField): Float32Array {
  const random = createRandom(seed);
  const { halfWidth, halfHeight, nearZ, farZ } = PARTICLE_BOUNDS;

  return Float32Array.from({ length: count * 3 }, (_, index) => {
    const axis = index % 3;
    if (axis === 0) return (random() * 2 - 1) * halfWidth;
    if (axis === 1) return (random() * 2 - 1) * halfHeight;

    return nearZ + random() * (farZ - nearZ);
  });
}
