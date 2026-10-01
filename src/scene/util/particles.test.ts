import { createParticlePositions, PARTICLE_BOUNDS } from './particles';

const COMPONENTS_PER_PARTICLE = 3;

describe('createParticlePositions', () => {
  it('creates three coordinates per particle', () => {
    const positions = createParticlePositions({ count: 50, seed: 1 });

    expect(positions).toHaveLength(50 * COMPONENTS_PER_PARTICLE);
  });

  it('is deterministic for a given seed', () => {
    const first = createParticlePositions({ count: 50, seed: 7 });
    const second = createParticlePositions({ count: 50, seed: 7 });

    expect(Array.from(first)).toEqual(Array.from(second));
  });

  it('differs between seeds', () => {
    const first = createParticlePositions({ count: 50, seed: 1 });
    const second = createParticlePositions({ count: 50, seed: 2 });

    expect(Array.from(first)).not.toEqual(Array.from(second));
  });

  it('keeps every particle behind the panels and inside the field', () => {
    const positions = createParticlePositions({ count: 200, seed: 3 });

    for (let index = 0; index < positions.length; index += COMPONENTS_PER_PARTICLE) {
      expect(Math.abs(positions[index] ?? NaN)).toBeLessThanOrEqual(PARTICLE_BOUNDS.halfWidth);
      expect(Math.abs(positions[index + 1] ?? NaN)).toBeLessThanOrEqual(PARTICLE_BOUNDS.halfHeight);
      expect(positions[index + 2]).toBeLessThanOrEqual(PARTICLE_BOUNDS.nearZ);
      expect(positions[index + 2]).toBeGreaterThanOrEqual(PARTICLE_BOUNDS.farZ);
    }
  });
});
