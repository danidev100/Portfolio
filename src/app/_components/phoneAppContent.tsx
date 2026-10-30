import type { ReactNode } from 'react';

import { AboutApp, ContactApp } from '@/profile';
import { ProjectsPhoneApp } from '@/projects';
import type { AppId } from '@/shared/util/apps';
import { TerminalPhoneApp } from '@/terminal';

/** What each app renders on the phone: simple content, without WebGL or CSS 3D. */
export const PHONE_APP_CONTENT: Readonly<Record<AppId, ReactNode>> = {
  projects: <ProjectsPhoneApp />,
  terminal: <TerminalPhoneApp />,
  about: <AboutApp />,
  contact: <ContactApp />,
};
