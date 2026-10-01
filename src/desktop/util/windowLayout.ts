import type { AppId } from './apps';

/** Shared by a dock icon and its window so one morphs into the other. */
export function getWindowLayoutId(id: AppId): string {
  return `window-${id}`;
}
