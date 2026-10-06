import { cva } from 'class-variance-authority';
import Link from 'next/link';
import { useId, type ReactNode } from 'react';

import { shouldActivateFromClick } from '../util/appLinks';
import { APPS, type AppId } from '../util/apps';

/** In order of importance: a recruiter comes for the profile first. */
const GREETING_ACTIONS: readonly { appId: AppId; label: string }[] = [
  { appId: 'about', label: 'Ver mi perfil y CV' },
  { appId: 'projects', label: 'Ver proyectos' },
  { appId: 'terminal', label: 'Pregúntale a mi IA' },
];

const action = cva(
  'inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-200 motion-reduce:transition-none',
  {
    variants: {
      emphasis: {
        primary: 'bg-primary text-on-primary hover:opacity-90',
        secondary: 'border border-border bg-surface/80 hover:bg-surface-raised',
      },
    },
  },
);

interface DesktopGreetingProps {
  /** The route the router is on: a link to it does not navigate. */
  currentHref: string;
  onOpen: (id: AppId) => void;
}

export function DesktopGreeting({ currentHref, onOpen }: DesktopGreetingProps): ReactNode {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center"
    >
      <h1 id={headingId} className="font-display text-4xl font-bold sm:text-6xl">
        Daniel Jaramillo
      </h1>
      <p className="text-lg text-muted">Frontend Tech Lead · AI App Developer</p>
      <p className="max-w-md text-sm text-muted">
        Este portafolio funciona como un escritorio: cada sección se abre en su propia ventana.
      </p>
      <ul className="mt-3 flex flex-wrap justify-center gap-3">
        {GREETING_ACTIONS.map(({ appId, label }, index) => (
          <li key={appId}>
            <Link
              href={APPS[appId].href}
              onClick={(event) => {
                if (shouldActivateFromClick(event, APPS[appId].href, currentHref)) onOpen(appId);
              }}
              className={action({ emphasis: index === 0 ? 'primary' : 'secondary' })}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
