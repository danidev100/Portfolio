import Link from 'next/link';
import type { MouseEvent, ReactNode } from 'react';

import { APPS } from '@/shared/util/apps';

import { OWNER } from '../util/home';

interface ProfileWidgetProps {
  onOpenCv: (event: MouseEvent<HTMLAnchorElement>) => void;
}

/** Who the phone belongs to, with a shortcut to the CV. */
export function ProfileWidget({ onOpenCv }: ProfileWidgetProps): ReactNode {
  return (
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
          onClick={onOpenCv}
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
        >
          Ver CV
        </Link>
      </div>
    </section>
  );
}
