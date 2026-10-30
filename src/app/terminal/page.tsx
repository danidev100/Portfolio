import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { APPS } from '@/shared/util/apps';

import { StandaloneAppPage } from '../_components/StandaloneAppPage';

export const metadata: Metadata = { title: APPS.terminal.title };

export default function TerminalPage({ searchParams }: PageProps<'/terminal'>): ReactNode {
  return <StandaloneAppPage appId="terminal" searchParams={searchParams} />;
}
