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
  /** Both return the window left in focus, or `null` when none is visible. */
  minimize: (id: AppId) => AppId | null;
  close: (id: AppId) => AppId | null;
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

  const navigateToFocusedWindow = (): AppId | null => {
    const focusedId = getFocusedWindowId(useWindowStore.getState().windows);
    const href = focusedId ? APPS[focusedId].href : DESKTOP_HREF;

    if (href !== pathname) router.push(href);

    return focusedId;
  };

  /**
   * After a window goes away. When the route is already the right one, it is
   * settled again on purpose: a window closed right after being opened still
   * has its navigation on the way, and it would reopen the window on landing.
   * A newer navigation, even to the current route, cancels that one.
   */
  const settleOnFocusedWindow = (): AppId | null => {
    const focusedId = navigateToFocusedWindow();
    const href = focusedId ? APPS[focusedId].href : DESKTOP_HREF;

    if (href === pathname) router.replace(href);

    return focusedId;
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

      return settleOnFocusedWindow();
    },
    close: (id) => {
      closeWindow(id);

      return settleOnFocusedWindow();
    },
  };
}
