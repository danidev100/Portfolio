import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { APPS } from '@/desktop';

import { StandaloneAppPage } from '../_components/StandaloneAppPage';

export const metadata: Metadata = { title: APPS.projects.title };

export default function ProjectsPage(): ReactNode {
  return <StandaloneAppPage appId="projects" />;
}
