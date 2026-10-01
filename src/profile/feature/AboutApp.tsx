import type { ReactNode } from 'react';

import { ACHIEVEMENTS, EXPERIENCE } from '../util/profile';

export function AboutApp(): ReactNode {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-lg">
        Soy Daniel Jaramillo, Frontend Tech Lead con foco en arquitectura de frontend y aplicaciones
        con IA.
      </p>
      <ol className="flex flex-col gap-3">
        {EXPERIENCE.map((experience) => (
          <li
            key={experience.company}
            className="rounded-card border border-border bg-surface-raised p-4"
          >
            <p className="font-semibold">{experience.company}</p>
            <p className="text-sm text-muted">
              {experience.role} · {experience.period}
            </p>
          </li>
        ))}
      </ol>
      <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-muted">
        {ACHIEVEMENTS.map((achievement) => (
          <li key={achievement}>{achievement}</li>
        ))}
      </ul>
    </div>
  );
}
