import type { AppTone } from '@/shared/util/apps';

/** Who the phone belongs to, on the profile widget. If the CV changes, this changes too. */
export const OWNER = {
  name: 'Daniel Jaramillo',
  initials: 'DJ',
  role: 'Frontend Tech Lead · AI App Developer',
  status: 'Disponible · Colombia UTC−5',
} as const;

/** Launchers that are not apps (Guía, CV) wear the neutral tone. */
export type LauncherTone = AppTone | 'neutral';
