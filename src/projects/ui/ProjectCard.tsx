import type { ReactNode } from 'react';

import { cn } from '@/shared/util/cn';

import { getIdeaLabel } from '../util/projectLabels';
import type { Project } from '../util/projects';
import { getSeriesClasses } from './seriesClasses';

/** A card has room for this many technologies; the case lists all of them. */
const VISIBLE_STACK_ITEMS = 3;

interface ProjectCardProps {
  project: Project;
  index: number;
}

/**
 * Only phrasing content, so the card can live inside a button. All of its text
 * becomes the name of that button, which keeps what is read aloud in line with
 * what is seen.
 */
export function ProjectCard({ project, index }: ProjectCardProps): ReactNode {
  return (
    <span className="flex h-full flex-col text-left">
      <span
        className={cn(
          'relative block h-1/3 shrink-0 overflow-hidden bg-linear-to-br to-surface-raised p-4',
          getSeriesClasses(index).gradientFrom,
        )}
      >
        <span className="font-mono text-xs font-medium tracking-wider text-on-series/75 uppercase">
          {getIdeaLabel(index)}
        </span>
        <span
          aria-hidden="true"
          className="absolute -top-6 -right-6 size-28 rounded-full bg-foreground/25"
        />
        <span
          aria-hidden="true"
          className="absolute top-12 right-16 size-12 rounded-full bg-foreground/25"
        />
      </span>
      <span className="flex min-h-0 flex-1 flex-col gap-2 p-4">
        <span className="font-display text-xl leading-tight font-bold">{project.name}</span>
        <span className="line-clamp-3 text-sm text-muted">{project.summary}</span>
        {/* A single row: the technologies that do not fit are listed in the case. */}
        <span className="mt-auto flex gap-1.5 overflow-hidden">
          {project.stack.slice(0, VISIBLE_STACK_ITEMS).map((technology) => (
            <span
              key={technology}
              className="shrink-0 rounded-full bg-border px-2.5 py-1 text-xs whitespace-nowrap"
            >
              {technology}
            </span>
          ))}
        </span>
      </span>
    </span>
  );
}
