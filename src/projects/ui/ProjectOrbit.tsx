'use client';

import { motion, useTransform, type MotionValue } from 'motion/react';
import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from 'react';

import { getCardOpacity, getStep } from '../util/orbit';
import type { Project } from '../util/projects';
import type { Box } from '../util/reveal';
import { ProjectCard } from './ProjectCard';
import { useOrbitRotation } from './useOrbitRotation';

/*
 * The whole orbit derives from the card width (`--spacing-orbit-card`), so it
 * scales as one piece. The ring is pushed back by its radius: the card in
 * front sits on the screen plane, at its natural size, and its text is sharp.
 */
const CARD_WIDTH = 'var(--spacing-orbit-card)';
const RING_RADIUS = `calc(${CARD_WIDTH} * 1.45)`;
const PERSPECTIVE = `calc(${CARD_WIDTH} * 5)`;
/**
 * A slight look from above, so the ring reads as a ring and not as a row.
 * Tilting lowers the card in front, and the lift puts it back in the middle.
 */
const RING_PLACEMENT = `translateY(calc(${CARD_WIDTH} * -0.12)) translateZ(calc(${RING_RADIUS} * -1)) rotateX(-5deg)`;
const GUIDE_DIAMETER = `calc(${RING_RADIUS} * 2)`;
/** Room for a card (3:4) plus its shadow, however short the container is. */
const STAGE_MIN_HEIGHT = `calc(${CARD_WIDTH} * 1.6)`;

const PREVIOUS_ICON_PATH = 'm14 7-5 5 5 5';
const NEXT_ICON_PATH = 'm10 7 5 5-5 5';

interface OrbitCardProps {
  project: Project;
  index: number;
  count: number;
  rotation: MotionValue<number>;
  isFront: boolean;
  onFocus: () => void;
  onOpen: () => void;
  buttonRef: (element: HTMLButtonElement | null) => void;
}

function OrbitCard({
  project,
  index,
  count,
  rotation,
  isFront,
  onFocus,
  onOpen,
  buttonRef,
}: OrbitCardProps): ReactNode {
  const nameId = useId();
  const summaryId = useId();
  const opacity = useTransform(rotation, (latest) => getCardOpacity(index, latest, count));

  return (
    <li
      className="absolute inset-0 backface-hidden"
      style={{
        transform: `rotateY(${String(index * getStep(count))}rad) translateZ(${RING_RADIUS})`,
      }}
    >
      <motion.div style={{ opacity }} className="size-full">
        <button
          ref={buttonRef}
          type="button"
          aria-labelledby={nameId}
          aria-describedby={summaryId}
          aria-current={isFront ? 'true' : undefined}
          onFocus={onFocus}
          onClick={onOpen}
          className="block size-full cursor-pointer overflow-hidden rounded-card border border-border bg-surface-raised shadow-window"
        >
          <ProjectCard project={project} index={index} nameId={nameId} summaryId={summaryId} />
        </button>
      </motion.div>
    </li>
  );
}

interface OrbitNavButtonProps {
  label: string;
  iconPath: string;
  onClick: () => void;
}

function OrbitNavButton({ label, iconPath, onClick }: OrbitNavButtonProps): ReactNode {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-11 items-center justify-center rounded-full border border-border bg-surface-raised transition-colors duration-200 hover:border-primary motion-reduce:transition-none"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={iconPath} />
      </svg>
    </button>
  );
}

interface ProjectOrbitProps {
  projects: readonly Project[];
  /** Takes the orbit out of reach, for instance while a case covers it. */
  isInert: boolean;
  /** `origin` is where the opened card is on screen, once it has settled in front. */
  onOpen: (index: number, origin: Box) => void;
}

/** The projects as cards on a ring that turns by drag, arrow keys or buttons. */
export function ProjectOrbit({ projects, isInert, onOpen }: ProjectOrbitProps): ReactNode {
  const count = projects.length;
  const { rotation, frontIndex, rotateToIndex, rotateToNeighbor, panHandlers } =
    useOrbitRotation(count);
  const ringRotation = useTransform(rotation, (latest) => `${String(latest)}rad`);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // A drag ends with a click on whatever card is under the pointer.
  const didPanRef = useRef(false);
  const focusIndexOnReturnRef = useRef<number | null>(null);

  useEffect(() => {
    if (isInert || focusIndexOnReturnRef.current === null) return;

    cardRefs.current[focusIndexOnReturnRef.current]?.focus();
    focusIndexOnReturnRef.current = null;
  }, [isInert]);

  const open = async (index: number): Promise<void> => {
    if (didPanRef.current) return;

    await rotateToIndex(index);
    const card = cardRefs.current[index];
    if (!card) return;

    focusIndexOnReturnRef.current = index;
    onOpen(index, card.getBoundingClientRect());
  };

  const turn = (direction: 1 | -1): void => {
    const nextFrontIndex = rotateToNeighbor(direction);
    const isFocusOnCard = cardRefs.current.some((card) => card === document.activeElement);
    if (isFocusOnCard) cardRefs.current[nextFrontIndex]?.focus();
  };

  const turnWithArrowKeys = (event: KeyboardEvent): void => {
    if (event.key === 'ArrowRight') turn(1);
    if (event.key === 'ArrowLeft') turn(-1);
  };

  return (
    <section
      aria-label="Órbita de proyectos"
      inert={isInert}
      onKeyDown={turnWithArrowKeys}
      className="@container flex min-h-0 flex-1 flex-col gap-4"
    >
      <motion.div
        {...panHandlers}
        onPanStart={(event, info) => {
          didPanRef.current = true;
          panHandlers.onPanStart(event, info);
        }}
        onPointerDownCapture={() => {
          didPanRef.current = false;
        }}
        style={{ perspective: PERSPECTIVE, minHeight: STAGE_MIN_HEIGHT }}
        className="flex flex-1 cursor-grab touch-pan-y items-center justify-center overflow-hidden rounded-card select-none active:cursor-grabbing"
      >
        <div
          className="relative aspect-3/4 w-orbit-card transform-3d"
          style={{ transform: RING_PLACEMENT }}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-full left-1/2 rounded-full border border-primary/25"
            style={{
              width: GUIDE_DIAMETER,
              height: GUIDE_DIAMETER,
              transform: 'translate(-50%, -50%) rotateX(90deg)',
            }}
          />
          <motion.ul
            aria-label="Proyectos"
            style={{ rotateY: ringRotation }}
            className="absolute inset-0 transform-3d"
          >
            {projects.map((project, index) => (
              <OrbitCard
                key={project.id}
                project={project}
                index={index}
                count={count}
                rotation={rotation}
                isFront={index === frontIndex}
                onFocus={() => {
                  void rotateToIndex(index);
                }}
                onOpen={() => {
                  void open(index);
                }}
                buttonRef={(element) => {
                  cardRefs.current[index] = element;
                }}
              />
            ))}
          </motion.ul>
        </div>
      </motion.div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-muted">
          Arrastra o usa las flechas. Abre una tarjeta para ver el caso.
        </p>
        <div className="flex gap-2">
          <OrbitNavButton
            label="Proyecto anterior"
            iconPath={PREVIOUS_ICON_PATH}
            onClick={() => {
              turn(-1);
            }}
          />
          <OrbitNavButton
            label="Proyecto siguiente"
            iconPath={NEXT_ICON_PATH}
            onClick={() => {
              turn(1);
            }}
          />
        </div>
      </div>
    </section>
  );
}
