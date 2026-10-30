import type { ReactNode } from 'react';

import { AboutApp, ContactApp } from '@/profile';
import { ProjectsApp } from '@/projects';
import { TerminalApp } from '@/terminal';
import type { AppId } from '@/shared/util/apps';

/** What each app renders, both inside its window and on its standalone page. */
export const APP_CONTENT: Readonly<Record<AppId, ReactNode>> = {
  projects: <ProjectsApp />,
  terminal: <TerminalApp />,
  about: <AboutApp />,
  contact: <ContactApp />,
};
