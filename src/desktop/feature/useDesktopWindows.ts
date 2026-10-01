'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useWindowStore } from '../data-access/useWindowStore';
import { APPS, DESKTOP_HREF, getAppIdByPathname, type AppId } from '../util/apps';
import { getFocusedWindowId, type WindowStack } from '../util/windowManager';

export interface DesktopWindows {
  windows: WindowStack;
  focusedId: AppId | null;
  /** Opens right away without navigating: the link that triggers it does. */
  open: (id: AppId) => void;
  focus: (id: AppId) => void;
  minimize: (id: AppId) => void;
  close: (id: AppId) => void;
}

/**
 * Keeps the window stack and the URL in step: the route names the focused
 * window and the desktop route means no window is visible.
 */
export function useDesktopWindows(): DesktopWindows {
  const pathname = usePathname();
  const router = useRouter();
  const windows = useWindowStore((state) => state.windows);
  const openWindow = useWindowStore((state) => state.openWindow);
  const focusWindow = useWindowStore((state) => state.focusWindow);
  const minimizeWindow = useWindowStore((state) => state.minimizeWindow);
  const closeWindow = useWindowStore((state) => state.closeWindow);
  const showDesktop = useWindowStore((state) => state.showDesktop);

  useEffect(() => {
    const routeAppId = getAppIdByPathname(pathname);

    if (routeAppId) openWindow(routeAppId);
    else showDesktop();
  }, [pathname, openWindow, showDesktop]);

  const navigateToFocusedWindow = (): void => {
    const focusedId = getFocusedWindowId(useWindowStore.getState().windows);
    const href = focusedId ? APPS[focusedId].href : DESKTOP_HREF;

    if (href !== pathname) router.push(href);
  };

  return {
    windows,
    focusedId: getFocusedWindowId(windows),
    open: openWindow,
    focus: (id) => {
      focusWindow(id);
      navigateToFocusedWindow();
    },
    minimize: (id) => {
      minimizeWindow(id);
      navigateToFocusedWindow();
    },
    close: (id) => {
      closeWindow(id);
      navigateToFocusedWindow();
    },
  };
}
