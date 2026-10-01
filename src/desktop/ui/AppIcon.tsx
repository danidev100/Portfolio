import { cva } from 'class-variance-authority';
import type { ReactNode } from 'react';

import { cn } from '@/shared/util/cn';

import type { AppId, AppTone } from '../util/apps';

const tile = cva('flex size-12 shrink-0 items-center justify-center rounded-control', {
  variants: {
    tone: {
      primary: 'bg-primary text-on-primary',
      ai: 'bg-ai text-on-ai',
      highlight: 'bg-highlight text-on-highlight',
      positive: 'bg-positive text-on-positive',
    } satisfies Record<AppTone, string>,
  },
});

const GLYPHS: Record<AppId, ReactNode> = {
  projects: (
    <>
      <circle cx="12" cy="12" r="3" />
      <ellipse cx="12" cy="12" rx="9" ry="4.5" transform="rotate(-25 12 12)" />
    </>
  ),
  terminal: (
    <>
      <path d="m5 8 4 4-4 4" />
      <path d="M12 16h7" />
    </>
  ),
  about: (
    <>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 19.5c1.2-3.4 3.8-5 7-5s5.8 1.6 7 5" />
    </>
  ),
  contact: (
    <>
      <rect x="3.5" y="6" width="17" height="12" rx="3" />
      <path d="m4.5 8 7.5 5.5L19.5 8" />
    </>
  ),
};

interface AppIconProps {
  appId: AppId;
  tone: AppTone;
  className?: string;
}

/** Decorative: the element that renders it provides the accessible name. */
export function AppIcon({ appId, tone, className }: AppIconProps): ReactNode {
  return (
    <span aria-hidden="true" className={cn(tile({ tone }), className)}>
      <svg
        viewBox="0 0 24 24"
        className="size-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {GLYPHS[appId]}
      </svg>
    </span>
  );
}
