'use client';

import { useEffect, useId, useRef, useState, type ReactNode, type SyntheticEvent } from 'react';

import { cn } from '@/shared/util/cn';

import type { AskStatus } from '../util/askState';
import { Caret } from './Caret';
import { TypewriterText } from './TypewriterText';

const CHIP_CLASSES =
  'rounded-full border border-ai/50 bg-surface-raised px-3 py-1.5 text-sm transition-colors duration-200 hover:border-ai motion-reduce:transition-none';

interface BubbleProps {
  from: 'ai' | 'visitor';
  isError?: boolean;
  children: ReactNode;
}

function Bubble({ from, isError = false, children }: BubbleProps): ReactNode {
  return (
    <p
      className={cn(
        'max-w-5/6 rounded-card px-4 py-2 text-sm',
        from === 'visitor' ? 'self-end bg-ai text-on-ai' : 'self-start bg-surface-raised',
        isError && 'text-highlight',
      )}
    >
      {children}
    </p>
  );
}

interface AskPanelProps {
  status: AskStatus;
  question: string | null;
  /** The answer so far, or the error message when `status` is `error`. */
  answer: string;
  suggestions: readonly string[];
  /** The graph is focused on some nodes, so there is an overview to go back to. */
  hasFocus: boolean;
  welcome: { text: string; isTyping: boolean };
  /** Puts the cursor in the field on mount: only where it will not pop up a keyboard. */
  autoFocusInput: boolean;
  onAsk: (question: string) => void;
  onReset: () => void;
}

/** The chat with the AI: what it is, a welcome, the exchange and where to ask. */
export function AskPanel({
  status,
  question,
  answer,
  suggestions,
  hasFocus,
  welcome,
  autoFocusInput,
  onAsk,
  onReset,
}: AskPanelProps): ReactNode {
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const conversationRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState('');
  const isAnswering = status === 'thinking' || status === 'streaming';

  useEffect(() => {
    if (autoFocusInput) inputRef.current?.focus({ preventScroll: true });
  }, [autoFocusInput]);

  // The exchange often outgrows its space: the newest words stay in view.
  useEffect(() => {
    const conversation = conversationRef.current;
    if (conversation) conversation.scrollTop = conversation.scrollHeight;
  }, [question, answer]);

  const askDraft = (event: SyntheticEvent): void => {
    event.preventDefault();
    if (!draft.trim()) return;

    onAsk(draft);
    setDraft('');
  };

  return (
    <section
      aria-labelledby={titleId}
      className="flex h-full flex-col gap-3 rounded-card bg-canvas p-4"
    >
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          {/* Level 2 under the window title and under the standalone page title alike. */}
          <h2 id={titleId} className="font-display text-xl font-bold">
            Pregúntale a mi IA
          </h2>
          <span className="rounded-full bg-ai/15 px-2 py-0.5 text-xs font-semibold text-ai">
            Demo
            <span className="sr-only">
              : Respuestas de demostración; la versión con IA real llega pronto
            </span>
          </span>
        </div>
        <p className="text-sm text-muted">
          Respondo sobre mi experiencia, proyectos y stack a partir de mi CV.
        </p>
      </header>
      {/* Focusable, so the keyboard can scroll it once it overflows. */}
      <div
        ref={conversationRef}
        role="group"
        aria-label="Conversación"
        tabIndex={0}
        className="flex min-h-24 flex-1 flex-col gap-3 overflow-auto rounded-card"
      >
        <Bubble from="ai">
          <TypewriterText text={welcome.text} isTyping={welcome.isTyping} />
        </Bubble>
        {/* `aria-busy` makes screen readers wait for the whole answer instead of
            reading it out token by token. */}
        <div role="status" aria-busy={isAnswering} className="flex flex-col gap-3">
          {question ? <Bubble from="visitor">{question}</Bubble> : null}
          {answer || isAnswering ? (
            <Bubble from="ai" isError={status === 'error'}>
              {answer}
              {isAnswering ? <Caret /> : null}
            </Bubble>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted">Prueba con:</p>
        <ul aria-label="Preguntas sugeridas" className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <li key={suggestion}>
              <button
                type="button"
                onClick={() => {
                  onAsk(suggestion);
                }}
                className={CHIP_CLASSES}
              >
                {suggestion}
              </button>
            </li>
          ))}
          {/* Always there, so the chips do not shift when the focus comes and goes. */}
          <li>
            <button
              type="button"
              onClick={onReset}
              disabled={!hasFocus}
              className={cn(
                CHIP_CLASSES,
                'border-border text-muted disabled:opacity-40 disabled:hover:border-border',
              )}
            >
              Vista general
            </button>
          </li>
        </ul>
      </div>
      <form
        onSubmit={askDraft}
        className="flex gap-2 rounded-full border border-border bg-surface-raised p-1.5"
      >
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
          }}
          aria-label="Pregunta al portafolio"
          placeholder="Ej.: ¿qué experiencia tienes en móvil?"
          autoComplete="off"
          className="min-w-0 flex-1 rounded-full bg-transparent px-3 text-sm placeholder:text-muted"
        />
        <button
          type="submit"
          className="rounded-full bg-ai px-4 py-2 text-sm font-semibold text-on-ai transition-opacity duration-200 hover:opacity-90 motion-reduce:transition-none"
        >
          Preguntar
        </button>
      </form>
    </section>
  );
}
