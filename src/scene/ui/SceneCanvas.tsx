'use client';

import { PerformanceMonitor } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useState, type ReactNode } from 'react';

import { cn } from '@/shared/util/cn';

import { CAMERA_FOV_DEGREES } from '../util/cameraPose';
import { isWebGLAvailable } from './webgl';

const MIN_DPR = 1;
/** Above this the extra pixels cost far more GPU time than they add sharpness. */
const MAX_DPR = 1.5;
const CAMERA = { fov: CAMERA_FOV_DEGREES, near: 0.1, far: 200 } as const;
const GL = { antialias: true, alpha: true, powerPreference: 'high-performance' } as const;
/**
 * Measures the layout size instead of the size on screen. A canvas inside a
 * window is mounted while the window is still scaling open, and would
 * otherwise keep the smaller size it had at that moment.
 */
const RESIZE = { offsetSize: true } as const;

interface SceneCanvasProps {
  /** The 3D scene. */
  children: ReactNode;
  /** DOM laid over the canvas, such as labels, that appears together with it. */
  overlay?: ReactNode;
}

/**
 * A WebGL canvas that fills its parent. It renders only when something
 * changes and fades in so that it never pops into view. Without WebGL it
 * renders nothing, and whatever is behind it stays as is.
 */
export function SceneCanvas({ children, overlay }: SceneCanvasProps): ReactNode {
  const [canRender] = useState(isWebGLAvailable);
  const [isReady, setIsReady] = useState(false);
  const [maxDpr, setMaxDpr] = useState(MAX_DPR);

  if (!canRender) return null;

  return (
    <div
      className={cn(
        'relative size-full transition-opacity duration-700 motion-reduce:transition-none',
        isReady ? 'opacity-100' : 'opacity-0',
      )}
    >
      <Canvas
        frameloop="demand"
        // No tone mapping: materials must show the design tokens exactly.
        flat
        dpr={[MIN_DPR, maxDpr]}
        camera={CAMERA}
        gl={GL}
        resize={RESIZE}
        onCreated={() => {
          setIsReady(true);
        }}
      >
        <PerformanceMonitor
          onDecline={() => {
            setMaxDpr(MIN_DPR);
          }}
        />
        {children}
      </Canvas>
      {overlay}
    </div>
  );
}
