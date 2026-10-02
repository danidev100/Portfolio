'use client';

import type { ReactNode } from 'react';

import { useAskStore } from '../data-access/useAskStore';
import { AskPanel } from '../ui/AskPanel';
import { SUGGESTED_QUESTIONS } from '../util/askAnswers';

/** The conversation: where the visitor asks and the answer streams in. */
export function TerminalAsk(): ReactNode {
  const status = useAskStore((state) => state.status);
  const question = useAskStore((state) => state.question);
  const answer = useAskStore((state) => state.answer);
  const hasFocus = useAskStore((state) => state.focusNodeIds.length > 0);
  const ask = useAskStore((state) => state.ask);
  const reset = useAskStore((state) => state.reset);

  return (
    <AskPanel
      status={status}
      question={question}
      answer={answer}
      suggestions={SUGGESTED_QUESTIONS}
      hasFocus={hasFocus}
      onAsk={(nextQuestion) => {
        void ask(nextQuestion);
      }}
      onReset={reset}
    />
  );
}
