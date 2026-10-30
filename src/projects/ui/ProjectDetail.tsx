'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useId, useRef, type ReactNode } from 'react';

import { cn } from '@/shared/util/cn';
import {
  FADE_TRANSITION,
  MORPH_TRANSITION,
  RADIUS_PX,
  REVEAL_TRANSITION,
} from '@/shared/util/motion';

import type { Project } from '../util/projects';
import { NO_INSETS, toInsetClipPath, type Box } from '../util/reveal';
import { ProjectFacts } from './ProjectFacts';
import { getSeriesClasses } from './seriesClasses';

const FULLY_REVEALED = toInsetClipPath(NO_INSETS, RADIUS_PX.card);

interface ProjectDetailProps {
  project: Project;
  /** What the project is: published work or a numbered idea. */
  label: string;
  index: number;
  /** Where the project's card is, as insets from the edges of this panel. */
  originInsets: Box;
  onClose: () => void;
}

/**
 * The case of a project. It is revealed outward from the project's card and
 * closes back into it; the panel itself never scales, so its text never
 * stretches.
 */
export function ProjectDetail({
  project,
  label,
  index,
  originInsets,
  onClose,
}: ProjectDetailProps): ReactNode {
  const nameId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const isMotionReduced = useReducedMotion();
  const clippedToCard = isMotionReduced
    ? FULLY_REVEALED
    : toInsetClipPath(originInsets, RADIUS_PX.card);

  useEffect(() => {
    closeButtonRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <motion.section
      aria-labelledby={nameId}
      initial={{ clipPath: clippedToCard, opacity: 0 }}
      animate={{ clipPath: FULLY_REVEALED, opacity: 1 }}
      exit={{ clipPath: clippedToCard, opacity: 0 }}
      transition={MORPH_TRANSITION}
      className="absolute inset-0 z-10 overflow-auto rounded-card border border-border bg-surface-raised"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: REVEAL_TRANSITION }}
        exit={{ opacity: 0 }}
        transition={FADE_TRANSITION}
        className="flex flex-col gap-5 p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p
              className={cn(
                'font-mono text-xs tracking-wider uppercase',
                getSeriesClasses(index).text,
              )}
            >
              {label}
            </p>
            {/* Level 2 in both places a case shows: under the window title and
                under the title of the standalone page, without skipping a level. */}
            <h2 id={nameId} className="font-display text-3xl font-bold">
              {project.name}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold transition-colors duration-200 hover:border-primary motion-reduce:transition-none"
          >
            Volver a la órbita
          </button>
        </div>
        <ProjectFacts project={project} />
      </motion.div>
    </motion.section>
  );
}
