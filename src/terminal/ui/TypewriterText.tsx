'use client';

import { useReducedMotion } from 'motion/react';
import { useEffect, useState, type ReactNode } from 'react';

import { toTokens } from '../util/tokens';
import { Caret } from './Caret';

/** Same pace as a streamed answer, so the welcome reads like one. */
const WORD_DELAY_MS = 35;

interface TypewriterTextProps {
  text: string;
  /** Types the text in; otherwise, and with reduced motion, shows it whole. */
  isTyping: boolean;
}

export function TypewriterText({ text, isTyping }: TypewriterTextProps): ReactNode {
  const isMotionReduced = useReducedMotion() ?? false;
  const words = toTokens(text);
  const [shownWords, setShownWords] = useState(isTyping && !isMotionReduced ? 0 : words.length);
  const wordCount = words.length;
  const isDone = shownWords >= wordCount;

  useEffect(() => {
    if (isDone) return;

    // One interval for the whole text: a timeout per word would wait for a
    // render between words and drift behind the pace of a streamed answer.
    const interval = setInterval(() => {
      setShownWords((count) => Math.min(count + 1, wordCount));
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
