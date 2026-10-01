'use client';

import {
  animate,
  useMotionValue,
  useMotionValueEvent,
  type MotionValue,
  type PanInfo,
} from 'motion/react';
import { useRef, useState } from 'react';

import {
  getFrontIndex,
  getNeighborRotation,
  getReleaseRotation,
  getRotationToIndex,
} from '../util/orbit';

/** How far the ring turns for each pixel the pointer travels. */
const RADIANS_PER_PIXEL = 0.006;
/** Critically damped: the ring settles on a card without swinging past it. */
const TURN_TRANSITION = { type: 'spring', duration: 0.7, bounce: 0 } as const;

type PanHandler = (event: PointerEvent, info: PanInfo) => void;

export interface OrbitRotation {
  /** Rotation of the ring in radians, updated without re-rendering. */
  rotation: MotionValue<number>;
  frontIndex: number;
  /** Resolves once the card at `index` has settled in front. */
  rotateToIndex: (index: number) => Promise<void>;
  /** Returns the index of the card that is now on its way to the front. */
  rotateToNeighbor: (direction: 1 | -1) => number;
  panHandlers: { onPanStart: PanHandler; onPan: PanHandler; onPanEnd: PanHandler };
}

export function useOrbitRotation(count: number): OrbitRotation {
  const rotation = useMotionValue(0);
  const [frontIndex, setFrontIndex] = useState(0);
  // Where the ring is heading. Steps are counted from here, not from where the
  // ring is mid-turn, so quick presses in a row are not swallowed.
  const targetRef = useRef(0);

  useMotionValueEvent(rotation, 'change', (latest) => {
    setFrontIndex(getFrontIndex(latest, count));
  });

  const turnTo = async (target: number, velocity = 0): Promise<void> => {
    targetRef.current = target;
    await animate(rotation, target, { ...TURN_TRANSITION, velocity });
  };

  return {
    rotation,
    frontIndex,
    rotateToIndex: (index) => turnTo(getRotationToIndex(targetRef.current, index, count)),
    rotateToNeighbor: (direction) => {
      const target = getNeighborRotation(targetRef.current, direction, count);
      void turnTo(target);

      return getFrontIndex(target, count);
    },
    panHandlers: {
      onPanStart: () => {
        rotation.stop();
      },
      onPan: (_event, info) => {
        rotation.set(rotation.get() + info.delta.x * RADIANS_PER_PIXEL);
      },
      onPanEnd: (_event, info) => {
        const velocity = info.velocity.x * RADIANS_PER_PIXEL;
        void turnTo(getReleaseRotation(rotation.get(), velocity, count), velocity);
      },
    },
  };
}
