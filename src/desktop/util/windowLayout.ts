import type { AppId } from './apps';

/**
 * Motion only keeps corners round while it scales an element when the radius
 * is a number, so these mirror `--radius-window` and `--radius-control`.
 */
export const WINDOW_RADIUS_PX = 28;
export const DOCK_ICON_RADIUS_PX = 14;

/** Critically damped: the window settles without overshooting. */
export const WINDOW_TRANSITION = { type: 'spring', duration: 0.5, bounce: 0 } as const;
export const WINDOW_CONTENT_TRANSITION = { duration: 0.2, ease: 'easeOut' } as const;
export const WINDOW_CONTENT_REVEAL_TRANSITION = { ...WINDOW_CONTENT_TRANSITION, delay: 0.25 };

/** Shared by a dock icon and its window so one morphs into the other. */
export function getWindowLayoutId(id: AppId): string {
  return `window-${id}`;
}
