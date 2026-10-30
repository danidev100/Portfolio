import Link from 'next/link';
import type { MouseEvent, ReactNode } from 'react';

import { HOME_HREF } from '@/shared/util/apps';

interface AppScreenProps {
  title: string;
  /** Decides whether the link to the home screen navigates or goes back in the history. */
  onHome: (event: MouseEvent<HTMLAnchorElement>) => void;
  children: ReactNode;
}

/** An app on the phone: a navigation bar back to the home screen and a large title. */
export function AppScreen({ title, onHome, children }: AppScreenProps): ReactNode {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-11 shrink-0 items-center px-2">
        <Link
          href={HOME_HREF}
          onClick={onHome}
          className="flex min-h-11 items-center gap-1 rounded-full px-2 text-primary"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 12 20"
            className="h-5 w-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 2 2 10l8 8" />
          </svg>
          Inicio
        </Link>
      </div>
      <h1 className="px-4 pb-4 font-display text-4xl font-bold">{title}</h1>
      <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">{children}</main>
    </div>
  );
}
