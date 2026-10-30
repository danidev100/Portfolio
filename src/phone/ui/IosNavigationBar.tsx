import Link from 'next/link';
import type { MouseEvent, ReactNode } from 'react';

import { HOME_HREF } from '@/shared/util/apps';

interface IosNavigationBarProps {
  title: string;
  /** Decides whether the link to the home screen navigates or goes back in the history. */
  onHome: (event: MouseEvent<HTMLAnchorElement>) => void;
}

/** iOS: «‹ Inicio» in the navigation bar and a large title under it. */
export function IosNavigationBar({ title, onHome }: IosNavigationBarProps): ReactNode {
  return (
    <header className="shrink-0">
      <div className="flex h-11 items-center px-2">
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
    </header>
  );
}
