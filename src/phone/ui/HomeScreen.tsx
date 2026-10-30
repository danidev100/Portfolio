import Link from 'next/link';
import type { MouseEvent, ReactNode } from 'react';

import { shouldActivateFromClick } from '@/shared/util/appLinks';
import { APP_IDS, APPS, type AppId } from '@/shared/util/apps';

import { OWNER } from '../util/home';
import { PhoneAppIcon } from './PhoneAppIcon';

interface HomeScreenProps {
  /** The route the router is on: a link to it must not navigate. */
  currentHref: string;
  onOpenApp: (id: AppId) => void;
  /** Launchers that are not links, such as the guide. */
  grid?: ReactNode;
}

/** The phone's home: who it belongs to, its launchers and the dock. */
export function HomeScreen({ currentHref, onOpenApp, grid }: HomeScreenProps): ReactNode {
  const openFromClick = (id: AppId) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (shouldActivateFromClick(event, APPS[id].href, currentHref)) onOpenApp(id);
  };

  return (
    <main className="flex h-full flex-col gap-6 px-6 pt-6 pb-2">
      <h1 className="sr-only">Dani OS</h1>
      <section
        aria-label="Perfil"
        className="flex flex-col gap-4 rounded-window border border-border bg-surface-raised p-5"
      >
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-13 items-center justify-center rounded-full bg-primary font-display text-xl font-bold text-on-primary"
          >
            {OWNER.initials}
          </span>
          <div>
            <p className="font-display text-lg font-semibold">{OWNER.name}</p>
            <p className="text-sm text-muted">{OWNER.role}</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm">
            <span aria-hidden="true" className="size-2 rounded-full bg-positive" />
            {OWNER.status}
          </p>
          <Link
            href={APPS.about.href}
            onClick={openFromClick('about')}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
          >
            Ver CV
          </Link>
        </div>
      </section>
      <nav aria-label="Apps" className="grid grid-cols-4 gap-y-5">
        <Link
          href={APPS.about.href}
          onClick={openFromClick('about')}
          className="flex flex-col items-center gap-1.5 justify-self-center rounded-control"
        >
          <PhoneAppIcon glyph="cv" tone="neutral" />
          <span className="text-xs font-medium">CV</span>
        </Link>
        {grid}
      </nav>
      <div className="mt-auto flex flex-col items-center gap-4">
        <Link
          href={APPS.terminal.href}
          onClick={openFromClick('terminal')}
          className="rounded-full bg-surface-raised px-4 py-2 text-sm font-medium"
        >
          Pregúntale a mi IA
        </Link>
        <nav
          aria-label="Dock"
          className="grid w-full grid-cols-4 rounded-window border border-border bg-surface-raised p-4"
        >
          {APP_IDS.map((id) => (
            <Link
              key={id}
              href={APPS[id].href}
              aria-label={APPS[id].title}
              onClick={openFromClick(id)}
              className="justify-self-center rounded-control"
            >
              <PhoneAppIcon glyph={id} tone={APPS[id].tone} />
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}
