import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { APPS } from '@/desktop';

import { StandaloneAppPage } from '../_components/StandaloneAppPage';

export const metadata: Metadata = { title: APPS.terminal.title };

export default function TerminalPage(): ReactNode {
  return <StandaloneAppPage appId="terminal" />;
}
