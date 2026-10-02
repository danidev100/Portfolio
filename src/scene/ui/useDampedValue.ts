'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';

import { clampFrameDelta, getDampingFactor, SETTLE_EPSILON } from '../util/damping';

const DEFAULT_LAMBDA = 6;

/**
 * Eases a number toward `target` inside the render loop and hands every step
 * to `apply`, typically to set a material or transform property without a
 * React render. It starts at the target, so nothing animates on mount, and it
 * only asks for frames while the value is still moving.
 */
export function useDampedValue(
  target: number,
  apply: (value: number) => void,
  lambda: number = DEFAULT_LAMBDA,
): void {
  const invalidate = useThree((state) => state.invalidate);
  const valueRef = useRef(target);
  const hasAppliedRef = useRef(false);

  useEffect(() => {
    invalidate();
  }, [target, invalidate]);

  useFrame((_, delta) => {
    const current = valueRef.current;
    if (hasAppliedRef.current && current === target) return;

    const stepped = current + (target - current) * getDampingFactor(lambda, clampFrameDelta(delta));
    const next = Math.abs(target - stepped) < SETTLE_EPSILON ? target : stepped;

    valueRef.current = next;
    hasAppliedRef.current = true;
    apply(next);
    if (next !== target) invalidate();
  });
}
