import { useId, type ReactNode } from 'react';

import { getProjectLabel } from '../util/projectLabels';
import type { Project } from '../util/projects';

/** DOM id of a project's row, to send the focus back to it when its screen closes. */
export function getProjectRowId(id: string): string {
  return `project-row-${id}`;
}

interface ProjectGroupProps {
  title: string;
  projects: readonly Project[];
  allProjects: readonly Project[];
  onOpen: (id: string) => void;
}

function ProjectGroup({ title, projects, allProjects, onOpen }: ProjectGroupProps): ReactNode {
  const titleId = useId();

  if (projects.length === 0) return null;

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-2">
      <h2 id={titleId} className="px-4 text-sm font-medium tracking-wide text-muted uppercase">
        {title}
      </h2>
      <ul className="divide-y divide-border overflow-hidden rounded-card bg-surface">
        {projects.map((project) => (
          <li key={project.id}>
            <button
              id={getProjectRowId(project.id)}
              type="button"
              onClick={(event) => {
                // A double tap would push the project into the history twice.
                if (event.detail > 1) return;

                onOpen(project.id);
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-200 active:bg-surface-raised motion-reduce:transition-none"
            >
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="font-semibold">{project.name}</span>
                <span className="text-sm text-muted">{project.summary}</span>
              </span>
              <span className="shrink-0 rounded-full bg-surface-raised px-2.5 py-1 font-mono text-xs">
                {getProjectLabel(project, allProjects)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

interface ProjectListProps {
  projects: readonly Project[];
  onOpen: (id: string) => void;
}

/** The projects as a native grouped list: published work first, then the ideas. */
export function ProjectList({ projects, onOpen }: ProjectListProps): ReactNode {
  return (
    <div className="flex flex-col gap-6">
      <ProjectGroup
        title="En producción"
        projects={projects.filter((project) => project.status === 'live')}
        allProjects={projects}
        onOpen={onOpen}
      />
      <ProjectGroup
        title="Ideas"
        projects={projects.filter((project) => project.status === 'idea')}
        allProjects={projects}
        onOpen={onOpen}
      />
    </div>
  );
}
