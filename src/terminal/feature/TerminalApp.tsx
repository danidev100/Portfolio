import type { ReactNode } from 'react';

import { TerminalAsk } from './TerminalAsk';
import { TerminalGraph } from './TerminalGraph';

export function TerminalApp(): ReactNode {
  return (
    <div className="@container h-full min-h-112">
      {/* Side by side when the window is wide enough; stacked otherwise. */}
      <div className="flex h-full flex-col gap-3 @3xl:flex-row">
        <TerminalGraph />
        <div className="@3xl:w-80 @3xl:shrink-0">
          <TerminalAsk />
        </div>
      </div>
    </div>
  );
}
