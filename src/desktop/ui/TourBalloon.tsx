'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';

import { FADE_TRANSITION } from '@/shared/util/motion';

import type { BalloonPosition } from '../util/balloonPosition';
import type { TourStep } from '../util/tourSteps';

const BUTTON =
  'rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 motion-reduce:transition-none';
const PRIMARY_BUTTON = `${BUTTON} bg-primary text-on-primary hover:opacity-90`;
const SECONDARY_BUTTON = `${BUTTON} border border-border hover:bg-surface`;
const QUIET_BUTTON =
  'rounded-full px-2 py-2 text-sm text-muted underline-offset-4 hover:text-foreground hover:underline';
/** Half the side of the rotated square that draws the arrow. */
const ARROW_HALF_SIZE_PX = 6;

interface TourBalloonProps {
  step: TourStep;
  /** 1-based. */
  stepNumber: number;
  stepCount: number;
  position: BalloonPosition;
  width: number;
  /** Shown on the last step: a link that ends the tour and opens an app. */
  finalAction: {
    label: string;
    href: string;
    onClick: (event: MouseEvent<HTMLAnchorElement>) => void;
  };
  onNext: () => void;
  onPrevious: () => void;
  /** «Saltar guía», «Terminar» and Escape. */
  onClose: () => void;
}

/** One step of the onboarding tour, pointing down at its anchor. Never blocks the page. */
export function TourBalloon({
  step,
  stepNumber,
  stepCount,
  position,
  width,
  finalAction,
  onNext,
  onPrevious,
  onClose,
}: TourBalloonProps): ReactNode {
  const titleId = useId();
  const bodyId = useId();
  const balloonRef = useRef<HTMLDivElement>(null);
  const isFirstStep = stepNumber === 1;
  const isLastStep = stepNumber === stepCount;

  // Each step is announced and reachable by keyboard as soon as it shows.
  useEffect(() => {
    balloonRef.current?.focus({ preventScroll: true });
  }, [step.id]);

  const closeOnEscape = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape') return;

    // The desktop closes the windows overview on Escape too.
    event.stopPropagation();
    onClose();
  };

  return (
    <motion.div
      ref={balloonRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      tabIndex={-1}
      onKeyDown={closeOnEscape}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={FADE_TRANSITION}
      style={{ left: position.left, bottom: position.bottom, width }}
      className="fixed z-50 flex flex-col gap-2 rounded-card border border-border bg-surface-raised p-4 shadow-window"
    >
      <p className="text-xs text-muted">
        Paso {stepNumber} de {stepCount}
      </p>
      <h2 id={titleId} className="font-display text-lg font-bold">
        {step.title}
      </h2>
      <p id={bodyId} className="text-sm">
        {step.body}
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <button type="button" onClick={onClose} className={QUIET_BUTTON}>
          {isLastStep ? 'Terminar' : 'Saltar guía'}
        </button>
        <div className="flex flex-wrap gap-2">
          {isFirstStep ? null : (
            <button type="button" onClick={onPrevious} className={SECONDARY_BUTTON}>
              Anterior
            </button>
          )}
          {isLastStep ? (
            <Link href={finalAction.href} onClick={finalAction.onClick} className={PRIMARY_BUTTON}>
              {finalAction.label}
            </Link>
          ) : (
            <button type="button" onClick={onNext} className={PRIMARY_BUTTON}>
              Siguiente
            </button>
          )}
        </div>
      </div>
      <span
        aria-hidden="true"
        style={{ left: position.arrowLeft - ARROW_HALF_SIZE_PX }}
        className="absolute -bottom-1.5 size-3 rotate-45 border-r border-b border-border bg-surface-raised"
      />
    </motion.div>
  );
}
