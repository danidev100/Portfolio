import type { ReactNode } from 'react';

import { TerminalAsk } from './TerminalAsk';

/** The chat alone: the phone leaves out the graph and its WebGL canvas. */
export function TerminalPhoneApp(): ReactNode {
  return (
    <div className="flex h-full flex-col">
      <TerminalAsk hasGraph={false} />
    </div>
  );
}
