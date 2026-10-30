import type { ReactNode } from 'react';

import type { Project } from '../util/projects';

interface ProjectFactProps {
  term: string;
  children: ReactNode;
}

function ProjectFact({ term, children }: ProjectFactProps): ReactNode {
  return (
    <div className="flex flex-col gap-1">
      <dt className="font-mono text-xs tracking-wider text-muted uppercase">{term}</dt>
      <dd>{children}</dd>
    </div>
  );
}

interface ProjectFactsProps {
  project: Project;
}

/** What a project is about, the same in its case on the desktop and on the phone. */
export function ProjectFacts({ project }: ProjectFactsProps): ReactNode {
  return (
    <>
      <p className="text-lg text-muted">{project.summary}</p>
      {project.url ? (
        <a
          href={project.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center self-start rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary transition-opacity duration-200 hover:opacity-90 motion-reduce:transition-none"
        >
          Ver el sitio en vivo
          <span className="sr-only"> (se abre en una pestaña nueva)</span>
        </a>
      ) : null}
      <dl className="grid gap-5 sm:grid-cols-2">
        <ProjectFact term="Para quién">{project.audience}</ProjectFact>
        <ProjectFact term="Dónde entra la IA">{project.aiRole}</ProjectFact>
        <ProjectFact term="Por qué importa">{project.value}</ProjectFact>
        <ProjectFact term="Stack">
          <ul className="flex flex-wrap gap-1.5">
            {project.stack.map((technology) => (
              <li key={technology} className="rounded-full bg-border px-3 py-1 text-sm">
                {technology}
              </li>
            ))}
          </ul>
        </ProjectFact>
      </dl>
    </>
  );
}
