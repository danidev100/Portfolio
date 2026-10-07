'use client';

import { useEffect, useState, type ReactNode } from 'react';

import { toTokens } from '../util/tokens';
import { Caret } from './Caret';

/** Same pace as a streamed answer, so the welcome reads like one. */
const WORD_DELAY_MS = 35;
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Asked at each tick and never while rendering: the server cannot know it, and
 * the first render in the browser has to match what the server sent.
 */
function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

interface TypewriterTextProps {
  text: string;
  /** Types the text in; otherwise, and with reduced motion, shows it whole at once. */
  isTyping: boolean;
}

export function TypewriterText({ text, isTyping }: TypewriterTextProps): ReactNode {
  const words = toTokens(text);
  const [shownWords, setShownWords] = useState(isTyping ? 0 : words.length);
  const wordCount = words.length;
  const isDone = shownWords >= wordCount;

  useEffect(() => {
    if (isDone) return;

    // One interval for the whole text: a timeout per word would wait for a
    // render between words and drift behind the pace of a streamed answer.
    const interval = setInterval(() => {
      const step = prefersReducedMotion() ? wordCount : 1;
      setShownWords((count) => Math.min(count + step, wordCount));
    }, WORD_DELAY_MS);

    return () => {
      clearInterval(interval);
    };
  }, [isDone, wordCount]);

  return (
    <>
      {words.slice(0, shownWords).join('')}
      {isDone ? null : <Caret />}
    </>
  );
}
