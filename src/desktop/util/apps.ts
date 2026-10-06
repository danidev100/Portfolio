export const APP_IDS = ['projects', 'terminal', 'about', 'contact'] as const;

export type AppId = (typeof APP_IDS)[number];

export type AppTone = 'primary' | 'ai' | 'highlight' | 'positive';

export interface AppDefinition {
  id: AppId;
  /** Full name: window title, tooltip, overview and page title. */
  title: string;
  /** Fits under the dock icon. The full title must contain it (label in name). */
  shortTitle: string;
  href: string;
  tone: AppTone;
}

export const APPS: Readonly<Record<AppId, AppDefinition>> = {
  projects: {
    id: 'projects',
    title: 'Proyectos',
    shortTitle: 'Proyectos',
    href: '/projects',
    tone: 'highlight',
  },
  terminal: {
    id: 'terminal',
    title: 'Pregúntale a mi IA',
    shortTitle: 'Mi IA',
    href: '/terminal',
    tone: 'ai',
  },
  about: {
    id: 'about',
    title: 'Perfil y CV',
    shortTitle: 'Perfil',
    href: '/about',
    tone: 'primary',
  },
  contact: {
    id: 'contact',
    title: 'Contacto',
    shortTitle: 'Contacto',
    href: '/contact',
    tone: 'positive',
  },
};

export const DESKTOP_HREF = '/';

export function getAppIdByPathname(pathname: string): AppId | null {
  return APP_IDS.find((id) => APPS[id].href === pathname) ?? null;
}

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
