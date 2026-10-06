'use client';

import { useSyncExternalStore, type ReactNode } from 'react';

import { formatClock } from '../util/formatClock';

const TICK_MS = 1000;
const MINUTE_MS = 60_000;

function subscribeToTicks(onTick: () => void): () => void {
  const intervalId = setInterval(onTick, TICK_MS);

  return () => {
    clearInterval(intervalId);
  };
}

function getCurrentMinute(): number {
  return Math.floor(Date.now() / MINUTE_MS);
}

/** The server cannot know the visitor's time zone, so it renders no time. */
function getServerMinute(): null {
  return null;
}

export function Clock(): ReactNode {
  const minute = useSyncExternalStore(subscribeToTicks, getCurrentMinute, getServerMinute);
  const date = minute === null ? null : new Date(minute * MINUTE_MS);

  return (
    <time dateTime={date?.toISOString()} className="text-center font-semibold sm:min-w-36">
      {date ? formatClock(date) : null}
    </time>
  );
}
