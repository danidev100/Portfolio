export const APP_IDS = ['projects', 'terminal', 'about', 'contact'] as const;

export type AppId = (typeof APP_IDS)[number];

export type AppTone = 'primary' | 'ai' | 'highlight' | 'positive';

export interface AppDefinition {
  id: AppId;
  title: string;
  href: string;
  tone: AppTone;
}

export const APPS: Readonly<Record<AppId, AppDefinition>> = {
  projects: { id: 'projects', title: 'Proyectos', href: '/projects', tone: 'highlight' },
  terminal: { id: 'terminal', title: 'Terminal', href: '/terminal', tone: 'ai' },
  about: { id: 'about', title: 'Sobre mí', href: '/about', tone: 'primary' },
  contact: { id: 'contact', title: 'Contacto', href: '/contact', tone: 'positive' },
};

export const DESKTOP_HREF = '/';

export function getAppIdByPathname(pathname: string): AppId | null {
  return APP_IDS.find((id) => APPS[id].href === pathname) ?? null;
}
