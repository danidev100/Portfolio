import type { ReactNode } from 'react';

import { PROJECTS } from '../util/projects';

export function ProjectsApp(): ReactNode {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {PROJECTS.map((project) => (
        <li key={project.id} className="rounded-card border border-border bg-surface-raised p-4">
          <p className="font-display text-lg font-bold">{project.name}</p>
          <p className="text-sm text-muted">{project.summary}</p>
        </li>
      ))}
    </ul>
  );
}
