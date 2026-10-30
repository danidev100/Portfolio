import type { AppId } from '@/shared/util/apps';

/** DOM id of an app's icon in the dock, to send the focus back to it. */
export function getDockItemId(id: AppId): string {
  return `dock-${id}`;
}

/** DOM id of an app's window, to move the focus into it when it is already open. */
export function getWindowId(id: AppId): string {
  return `window-${id}`;
}

/** DOM id of the dock itself, where the onboarding tour points to. */
export const DOCK_ID = 'dock';
