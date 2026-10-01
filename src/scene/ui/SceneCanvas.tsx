'use client';

import { PerformanceMonitor } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useState, type ReactNode } from 'react';

import { cn } from '@/shared/util/cn';

import { isWebGLAvailable } from './webgl';

const MIN_DPR = 1;
/** Above this the extra pixels cost far more GPU time than they add sharpness. */
const MAX_DPR = 1.5;
const CAMERA = { fov: 45, near: 0.1, far: 200 } as const;
const GL = { antialias: true, alpha: true, powerPreference: 'high-performance' } as const;

interface SceneCanvasProps {
  children: ReactNode;
}

/**
 * The WebGL canvas, laid behind the DOM. It is decorative, renders only when
 * something changes, and fades in so that it never pops into view. Without
 * WebGL it renders nothing and the CSS wallpaper underneath stays as is.
 */
export function SceneCanvas({ children }: SceneCanvasProps): ReactNode {
  const [canRender] = useState(isWebGLAvailable);
  const [isReady, setIsReady] = useState(false);
  const [maxDpr, setMaxDpr] = useState(MAX_DPR);

  if (!canRender) return null;

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 -z-10 transition-opacity duration-700 motion-reduce:transition-none',
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
    </div>
  );
}
