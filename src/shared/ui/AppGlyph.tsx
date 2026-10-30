import type { ReactNode } from 'react';

import type { AppId } from '@/shared/util/apps';

/** Apps plus the launchers that only the phone has. */
export type AppGlyphId = AppId | 'guide' | 'cv';

const GLYPHS: Record<AppGlyphId, ReactNode> = {
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
  guide: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5l-2 5-5 2 2-5z" />
    </>
  ),
  cv: (
    <>
      <path d="M7 3h7l5 5v13H7z" />
      <path d="M14 3v5h5" />
      <path d="M10 13h6M10 17h6" />
    </>
  ),
};

interface AppGlyphProps {
  glyph: AppGlyphId;
  className?: string;
}

/** Decorative: the element that renders it provides the accessible name. */
export function AppGlyph({ glyph, className }: AppGlyphProps): ReactNode {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {GLYPHS[glyph]}
    </svg>
  );
}
