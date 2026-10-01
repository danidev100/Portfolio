'use client';

import { useMemo, type ReactNode } from 'react';

import { createParticlePositions } from '../util/particles';
import { readThemeColor } from './themeColor';

const FIELD = { count: 220, seed: 20261001 } as const;
const PARTICLE_SIZE = 0.05;
const PARTICLE_OPACITY = 0.5;

/** Soft dust far behind the panels that gives the camera moves a sense of depth. */
export function Particles(): ReactNode {
  // The buffer is uploaded to the GPU once; a new array would upload it again.
  const positions = useMemo(() => createParticlePositions(FIELD), []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={readThemeColor('--color-primary')}
        size={PARTICLE_SIZE}
        opacity={PARTICLE_OPACITY}
        transparent
        depthWrite={false}
      />
    </points>
  );
}
