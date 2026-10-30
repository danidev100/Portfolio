import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { APPS } from '@/shared/util/apps';

import { StandaloneAppPage } from '../_components/StandaloneAppPage';

export const metadata: Metadata = { title: APPS.projects.title };

export default function ProjectsPage({ searchParams }: PageProps<'/projects'>): ReactNode {
  return <StandaloneAppPage appId="projects" searchParams={searchParams} />;
}
