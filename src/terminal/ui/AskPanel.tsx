'use client';

import { useState, type ReactNode, type SyntheticEvent } from 'react';

import { cn } from '@/shared/util/cn';

import type { AskStatus } from '../util/askState';

const PROMPT = 'dani@fedora ~ $';
const INVITATION =
  'Pregunta por mi experiencia. El grafo se enfoca en lo que tenga que ver con la respuesta.';

const CHIP_CLASSES =
  'rounded-full border border-border bg-surface-raised px-3 py-1.5 text-sm transition-colors duration-200 hover:border-primary motion-reduce:transition-none';

interface AskPanelProps {
  status: AskStatus;
  question: string | null;
  /** The answer so far, or the error message when `status` is `error`. */
  answer: string;
  suggestions: readonly string[];
  /** The graph is focused on some nodes, so there is an overview to go back to. */
  hasFocus: boolean;
  onAsk: (question: string) => void;
  onReset: () => void;
}

/** Where the visitor asks, and where the answer streams in like in a terminal. */
export function AskPanel({
  status,
  question,
  answer,
  suggestions,
  hasFocus,
  onAsk,
  onReset,
}: AskPanelProps): ReactNode {
  const [draft, setDraft] = useState('');
  const isAnswering = status === 'thinking' || status === 'streaming';

  const askDraft = (event: SyntheticEvent): void => {
    event.preventDefault();
    if (!draft.trim()) return;

    onAsk(draft);
    setDraft('');
  };

  return (
    <div className="flex h-full flex-col gap-3">
      {/* `aria-busy` makes screen readers wait for the whole answer instead of
          reading it out token by token. */}
      <div
        role="status"
        aria-busy={isAnswering}
        className="flex max-h-40 min-h-20 flex-1 flex-col gap-1 overflow-auto rounded-card bg-canvas p-4 font-mono text-sm @3xl:max-h-none"
      >
        {question ? (
          <p>
            <span className="text-positive">{PROMPT}</span> ask &quot;{question}&quot;
          </p>
        ) : null}
        <p className={cn(status === 'error' ? 'text-highlight' : 'text-muted')}>
          {answer || (isAnswering ? '' : INVITATION)}
          {isAnswering ? (
            <span
              aria-hidden="true"
              className="rounded-sm ml-0.5 inline-block h-4 w-2 animate-pulse bg-ai align-text-bottom motion-reduce:animate-none"
            />
          ) : null}
        </p>
      </div>
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
              'text-muted disabled:opacity-40 disabled:hover:border-border',
            )}
          >
            Vista general
          </button>
        </li>
      </ul>
      <form
        onSubmit={askDraft}
        className="flex gap-2 rounded-full border border-border bg-surface-raised p-1.5"
      >
        <input
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
    </div>
  );
}
