import type { ReactNode } from 'react';

import type { AppId } from '@/desktop';
import { AboutApp, ContactApp } from '@/profile';
import { ProjectsApp } from '@/projects';
import { TerminalApp } from '@/terminal';

/** What each app renders, both inside its window and on its standalone page. */
export const APP_CONTENT: Readonly<Record<AppId, ReactNode>> = {
  projects: <ProjectsApp />,
  terminal: <TerminalApp />,
  about: <AboutApp />,
  contact: <ContactApp />,
};
