import type { ReactNode } from 'react';

/** Blinks while text is on its way. Decorative. */
export function Caret(): ReactNode {
  return (
    <span
      aria-hidden="true"
      className="ml-0.5 inline-block h-4 w-2 animate-pulse rounded-full bg-ai align-text-bottom motion-reduce:animate-none"
    />
  );
}
