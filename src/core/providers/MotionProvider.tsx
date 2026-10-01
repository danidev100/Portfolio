'use client';

import { MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';

interface MotionProviderProps {
  children: ReactNode;
}

/** Makes every Motion animation honor the visitor's "reduce motion" setting. */
export function MotionProvider({ children }: MotionProviderProps): ReactNode {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
