import Link from 'next/link';
import type { ReactNode } from 'react';

import { DESKTOP_HREF } from '../util/apps';

interface StandalonePageProps {
  title: string;
  children: ReactNode;
}

/** Full page for an app opened by its URL, outside of the desktop shell. */
export function StandalonePage({ title, children }: StandalonePageProps): ReactNode {
  return (
    <div className="mx-auto flex min-h-dvh max-w-4xl flex-col gap-4 p-4 sm:p-6">
      <header className="flex items-center justify-between rounded-full border border-border bg-surface p-1.5 text-sm">
        <Link
          href={DESKTOP_HREF}
          className="rounded-full px-4 py-1.5 font-semibold transition-colors duration-200 hover:bg-surface-raised motion-reduce:transition-none"
        >
          Ir al escritorio
        </Link>
        <p className="px-4 text-muted">Dani OS</p>
      </header>
      <main className="flex-1 rounded-window border border-border bg-surface p-6 sm:p-8">
        <h1 className="mb-6 font-display text-4xl font-bold">{title}</h1>
        {children}
      </main>
    </div>
  );
}
