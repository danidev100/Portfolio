import Link from 'next/link';
import type { MouseEvent, ReactNode } from 'react';

import { HOME_HREF } from '@/shared/util/apps';

interface AndroidTopAppBarProps {
  title: string;
  /** Decides whether the link to the home screen navigates or goes back in the history. */
  onHome: (event: MouseEvent<HTMLAnchorElement>) => void;
}

/** Android: a back arrow and the title, together in the top app bar. */
export function AndroidTopAppBar({ title, onHome }: AndroidTopAppBarProps): ReactNode {
  return (
    <header className="flex h-16 shrink-0 items-center gap-1 px-1">
      <Link
        href={HOME_HREF}
        aria-label="Inicio"
        onClick={onHome}
        className="flex size-12 items-center justify-center rounded-full"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </Link>
      <h1 className="font-display text-xl font-semibold">{title}</h1>
    </header>
  );
}
