import type { ReactNode } from 'react';

import { TerminalAsk } from './TerminalAsk';
import { TerminalGraph } from './TerminalGraph';

export function TerminalApp(): ReactNode {
  return (
    <div className="@container h-full min-h-112">
      {/* The chat comes first, left or on top: it is what the app is for. */}
      <div className="flex h-full flex-col gap-3 @3xl:flex-row">
        <div className="@3xl:w-96 @3xl:shrink-0">
          <TerminalAsk />
        </div>
        <TerminalGraph />
      </div>
    </div>
  );
}
