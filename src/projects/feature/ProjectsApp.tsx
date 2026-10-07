'use client';

import { AnimatePresence } from 'motion/react';
import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

import { ProjectDetail } from '../ui/ProjectDetail';
import { ProjectOrbit } from '../ui/ProjectOrbit';
import { getProjectLabel } from '../util/projectLabels';
import { PROJECTS } from '../util/projects';
import { getInsets, NO_INSETS, type Box } from '../util/reveal';

interface OpenCase {
  index: number;
  /** Where its card is, as insets from the edges of the app. */
  originInsets: Box;
}

export function ProjectsApp(): ReactNode {
  const containerRef = useRef<HTMLDivElement>(null);
  const [openCase, setOpenCase] = useState<OpenCase | null>(null);
  const openProject = openCase ? PROJECTS[openCase.index] : undefined;

  const open = (index: number, origin: Box): void => {
    const container = containerRef.current?.getBoundingClientRect();
    setOpenCase({ index, originInsets: container ? getInsets(container, origin) : NO_INSETS });
  };

  const close = (): void => {
    setOpenCase(null);
  };

  const closeOnEscape = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') close();
  };

  return (
    <div
      ref={containerRef}
      className="relative flex h-full min-h-112 flex-col"
      onKeyDown={closeOnEscape}
    >
      <p className="pb-3 text-center text-sm text-muted">
        NEXA es mi primer proyecto publicado. Las demás tarjetas son ideas que estoy explorando: iré
        sumando proyectos reales a medida que salgan.
      </p>
      <ProjectOrbit projects={PROJECTS} isInert={openCase !== null} onOpen={open} />
      <AnimatePresence>
        {openCase && openProject ? (
          <ProjectDetail
            key={openProject.id}
            project={openProject}
            label={getProjectLabel(openProject, PROJECTS)}
            index={openCase.index}
            originInsets={openCase.originInsets}
            onClose={close}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
