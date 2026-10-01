'use client';

import { useMemo, type ReactNode } from 'react';
import { Shape } from 'three';

import type { Vec3 } from '../util/scenePanel';

function createRoundedRectangle(width: number, height: number, radius: number): Shape {
  const left = -width / 2;
  const bottom = -height / 2;
  const right = left + width;
  const top = bottom + height;

  return new Shape()
    .moveTo(left + radius, bottom)
    .lineTo(right - radius, bottom)
    .quadraticCurveTo(right, bottom, right, bottom + radius)
    .lineTo(right, top - radius)
    .quadraticCurveTo(right, top, right - radius, top)
    .lineTo(left + radius, top)
    .quadraticCurveTo(left, top, left, top - radius)
    .lineTo(left, bottom + radius)
    .quadraticCurveTo(left, bottom, left + radius, bottom);
}

interface RoundedPanelProps {
  width: number;
  height: number;
  radius: number;
  color: string;
  opacity?: number;
  position?: Vec3;
  /** Panels do not write depth, so overlapping ones need an explicit order. */
  renderOrder?: number;
}

/** Flat rectangle with rounded corners: nothing in the scene has square ones. */
export function RoundedPanel({
  width,
  height,
  radius,
  color,
  opacity = 1,
  position,
  renderOrder = 0,
}: RoundedPanelProps): ReactNode {
  // Rebuilding the shape would re-upload its geometry to the GPU on every render.
  const shape = useMemo(
    () => createRoundedRectangle(width, height, radius),
    [width, height, radius],
  );

  return (
    <mesh position={position} renderOrder={renderOrder}>
      <shapeGeometry args={[shape]} />
      <meshBasicMaterial color={color} opacity={opacity} transparent depthWrite={false} />
    </mesh>
  );
}
