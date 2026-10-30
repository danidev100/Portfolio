import type { AppId } from '@/shared/util/apps';

export interface GuideEntry {
  appId: AppId;
  description: string;
}

/** The guide stands in for the desktop's tour: one line per app, in dock order. */
export const GUIDE_ENTRIES: readonly GuideEntry[] = [
  { appId: 'projects', description: 'Mi trabajo publicado y mis ideas.' },
  { appId: 'terminal', description: 'Pregunta lo que quieras sobre mi experiencia.' },
  { appId: 'about', description: 'Mi experiencia, en pantalla y en PDF.' },
  { appId: 'contact', description: 'Cómo escribirme.' },
];
