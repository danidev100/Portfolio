'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, type ReactNode } from 'react';
import { Vector3 } from 'three';

import { getEntryPose, type CameraPose } from '../util/cameraPose';
import { clampFrameDelta, getDampingFactor, isSettled } from '../util/damping';

const CAMERA_DAMPING = 3.2;
const PARALLAX_DAMPING = 4;
/** How far the camera drifts, in world units, when the pointer reaches an edge. */
const PARALLAX_REACH = { x: 0.18, y: 0.11 } as const;
const FINE_POINTER_QUERY = '(pointer: fine)';

interface RigState {
  position: Vector3;
  lookAt: Vector3;
  /** Smoothed pointer position; z is unused. */
  parallax: Vector3;
  /** Reused every frame to avoid allocating in the render loop. */
  target: Vector3;
}

function createRigState({ position, lookAt }: CameraPose): RigState {
  return {
    position: new Vector3(...position),
    lookAt: new Vector3(...lookAt),
    parallax: new Vector3(),
    target: new Vector3(),
  };
}

interface CameraRigProps {
  /** Must keep its identity while the target does not change. */
  pose: CameraPose;
  isMotionReduced: boolean;
}

/**
 * Eases the camera toward `pose` with exponential damping, so it never jumps,
 * and only asks for new frames while something is still moving.
 */
export function CameraRig({ pose, isMotionReduced }: CameraRigProps): ReactNode {
  const invalidate = useThree((state) => state.invalidate);
  const rigRef = useRef<RigState | null>(null);
  const pointerRef = useRef(new Vector3());

  useEffect(() => {
    invalidate();
  }, [pose, invalidate]);

  useEffect(() => {
    if (isMotionReduced || !window.matchMedia(FINE_POINTER_QUERY).matches) return;

    const followPointer = (event: PointerEvent): void => {
      pointerRef.current.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        1 - (event.clientY / window.innerHeight) * 2,
        0,
      );
      invalidate();
    };
    window.addEventListener('pointermove', followPointer);

    return () => {
      window.removeEventListener('pointermove', followPointer);
    };
  }, [isMotionReduced, invalidate]);

  useFrame(({ camera }, delta) => {
    rigRef.current ??= createRigState(isMotionReduced ? pose : getEntryPose(pose));
    const rig = rigRef.current;
    const deltaSeconds = clampFrameDelta(delta);
    const cameraFactor = isMotionReduced ? 1 : getDampingFactor(CAMERA_DAMPING, deltaSeconds);
    const parallaxFactor = isMotionReduced ? 1 : getDampingFactor(PARALLAX_DAMPING, deltaSeconds);

    rig.position.lerp(rig.target.set(...pose.position), cameraFactor);
    rig.lookAt.lerp(rig.target.set(...pose.lookAt), cameraFactor);
    rig.parallax.lerp(pointerRef.current, parallaxFactor);

    camera.position.set(
      rig.position.x + rig.parallax.x * PARALLAX_REACH.x,
      rig.position.y + rig.parallax.y * PARALLAX_REACH.y,
      rig.position.z,
    );
    camera.lookAt(rig.lookAt);

    const isAtRest =
      isSettled(rig.position.toArray(), pose.position) &&
      isSettled(rig.lookAt.toArray(), pose.lookAt) &&
      isSettled(rig.parallax.toArray(), pointerRef.current.toArray());
    if (!isAtRest) invalidate();
  });

  return null;
}
