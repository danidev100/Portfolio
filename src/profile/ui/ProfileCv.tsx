import Link from 'next/link';
import { useId, type ReactNode } from 'react';

import type { ProfileCvData } from '../util/profile';

const BUTTON =
  'inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-200 motion-reduce:transition-none';

interface CvSectionProps {
  title: string;
  isEmpty: boolean;
  children: ReactNode;
}

/** A titled part of the CV. A part without data is left out, title included. */
function CvSection({ title, isEmpty, children }: CvSectionProps): ReactNode {
  const titleId = useId();
  if (isEmpty) return null;

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-3">
      {/* Level 2 under the window title and under the standalone page title alike. */}
      <h2 id={titleId} className="font-display text-xl font-bold">
        {title}
      </h2>
      {children}
    </section>
  );
}

interface ProfileCvProps {
  cv: ProfileCvData;
  cvPdfHref: string;
  contactHref: string;
}

export function ProfileCv({ cv, cvPdfHref, contactHref }: ProfileCvProps): ReactNode {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="font-display text-2xl font-bold">{cv.name}</p>
        <p className="text-muted">
          {cv.role} · {cv.location}
        </p>
        <p className="max-w-prose">{cv.summary}</p>
        <div className="mt-2 flex flex-wrap gap-3">
          <a
            href={cvPdfHref}
            download
            className={`${BUTTON} bg-primary text-on-primary hover:opacity-90`}
          >
            Descargar CV (PDF)
          </a>
          <Link
            href={contactHref}
            className={`${BUTTON} border border-border hover:bg-surface-raised`}
          >
            Contactar
          </Link>
        </div>
      </header>

      <CvSection title="Experiencia" isEmpty={cv.experience.length === 0}>
        <div className="flex flex-col gap-3">
          {cv.experience.map((job) => (
            <article
              key={job.company}
              className="rounded-card border border-border bg-surface-raised p-4"
            >
              <p className="font-semibold">{job.company}</p>
              <p className="text-sm text-muted">
                {job.role} · {job.period}
              </p>
              <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-sm">
                {job.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted">{job.stack.join(' · ')}</p>
            </article>
          ))}
        </div>
      </CvSection>

      <CvSection title="Skills" isEmpty={cv.skillGroups.length === 0}>
        <dl className="grid gap-4 sm:grid-cols-2">
          {cv.skillGroups.map((group) => (
            <div key={group.name} className="flex flex-col gap-1">
              <dt className="font-mono text-xs tracking-wider text-muted uppercase">
                {group.name}
              </dt>
              {group.skills.map((skill) => (
                <dd key={skill.name} className="text-sm">
                  {skill.name} <span className="text-muted">({skill.level})</span>
                </dd>
              ))}
            </div>
          ))}
        </dl>
      </CvSection>

      <CvSection title="Formación" isEmpty={cv.education.length === 0}>
        <ul className="flex flex-col gap-1 text-sm">
          {cv.education.map((entry) => (
            <li key={entry.degree}>
              <span className="font-semibold">{entry.degree}</span> — {entry.institution}{' '}
              <span className="text-muted">({entry.period})</span>
            </li>
          ))}
        </ul>
      </CvSection>

      <CvSection title="Cursos y certificaciones" isEmpty={cv.courses.length === 0}>
        <ul className="flex flex-col gap-1 text-sm">
          {cv.courses.map((course) => (
            <li key={`${course.provider}-${course.name}`}>
              {course.provider} · {course.name} <span className="text-muted">({course.year})</span>
            </li>
          ))}
        </ul>
      </CvSection>

      <CvSection title="Idiomas" isEmpty={cv.languages.length === 0}>
        <ul className="flex flex-wrap gap-2 text-sm">
          {cv.languages.map((language) => (
            <li key={language.name} className="rounded-full bg-border px-3 py-1">
              {language.name} ({language.level})
            </li>
          ))}
        </ul>
      </CvSection>
    </div>
  );
}
