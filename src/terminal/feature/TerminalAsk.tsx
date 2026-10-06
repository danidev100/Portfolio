'use client';

import { useEffect, useState, type ReactNode } from 'react';

import { useAskStore } from '../data-access/useAskStore';
import { AskPanel } from '../ui/AskPanel';
import { SUGGESTED_QUESTIONS, WELCOME_MESSAGE } from '../util/askAnswers';

const FINE_POINTER_QUERY = '(pointer: fine)';

/** Only with a mouse or trackpad: on a phone, focusing would pop up the keyboard. */
function hasFinePointer(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia(FINE_POINTER_QUERY).matches;
}

/** The conversation: where the visitor asks and the answer streams in. */
export function TerminalAsk(): ReactNode {
  const status = useAskStore((state) => state.status);
  const question = useAskStore((state) => state.question);
  const answer = useAskStore((state) => state.answer);
  const hasFocus = useAskStore((state) => state.focusNodeIds.length > 0);
  const hasWelcomed = useAskStore((state) => state.hasWelcomed);
  const ask = useAskStore((state) => state.ask);
  const reset = useAskStore((state) => state.reset);
  const markWelcomed = useAskStore((state) => state.markWelcomed);
  // Read once: the welcome is typed on the first opening of the visit only.
  const [isTypingWelcome] = useState(!hasWelcomed);
  // Decided after hydration: the server has no pointer to ask about.
  const [autoFocusInput, setAutoFocusInput] = useState(false);

  useEffect(() => {
    markWelcomed();
  }, [markWelcomed]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncs with a browser media query, which only exists after hydration
    setAutoFocusInput(hasFinePointer());
  }, []);

  return (
    <AskPanel
      status={status}
      question={question}
      answer={answer}
      suggestions={SUGGESTED_QUESTIONS}
      hasFocus={hasFocus}
      welcome={{ text: WELCOME_MESSAGE, isTyping: isTypingWelcome }}
      autoFocusInput={autoFocusInput}
      onAsk={(nextQuestion) => {
        void ask(nextQuestion);
      }}
      onReset={reset}
    />
  );
}
