'use client';

import { motion } from 'motion/react';
import { useEffect, useId, useRef, type ReactNode } from 'react';

import { cn } from '@/shared/util/cn';

import type { AppId } from '../util/apps';
import {
  getWindowLayoutId,
  WINDOW_CONTENT_REVEAL_TRANSITION,
  WINDOW_CONTENT_TRANSITION,
  WINDOW_RADIUS_PX,
  WINDOW_TRANSITION,
} from '../util/windowLayout';

interface WindowControlProps {
  label: string;
  iconPath: string;
  onClick: () => void;
}

function WindowControl({ label, iconPath, onClick }: WindowControlProps): ReactNode {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-9 items-center justify-center rounded-full bg-surface text-muted transition-colors duration-200 hover:bg-border hover:text-foreground motion-reduce:transition-none"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d={iconPath} />
      </svg>
    </button>
  );
}

const MINIMIZE_ICON_PATH = 'M6 12h12';
const CLOSE_ICON_PATH = 'M7 7l10 10M17 7 7 17';

interface WindowProps {
  appId: AppId;
  title: string;
  isFocused: boolean;
  zIndex: number;
  className?: string;
  onFocus: () => void;
  onMinimize: () => void;
  onClose: () => void;
  children: ReactNode;
}

export function Window({
  appId,
  title,
  isFocused,
  zIndex,
  className,
  onFocus,
  onMinimize,
  onClose,
  children,
}: WindowProps): ReactNode {
  const titleId = useId();
  const windowRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = windowRef.current;
    if (!isFocused || !element || element.contains(document.activeElement)) return;

    element.focus({ preventScroll: true });
  }, [isFocused]);

  return (
    <motion.section
      ref={windowRef}
      role="dialog"
      aria-labelledby={titleId}
      tabIndex={-1}
      layoutId={getWindowLayoutId(appId)}
      transition={WINDOW_TRANSITION}
      style={{ zIndex, borderRadius: WINDOW_RADIUS_PX }}
      onPointerDown={onFocus}
      className={cn(
        'absolute inset-0 overflow-hidden border border-border bg-surface shadow-window',
        className,
      )}
    >
      {/* Waits for most of the morph so the content is never seen stretched. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: WINDOW_CONTENT_REVEAL_TRANSITION }}
        exit={{ opacity: 0 }}
        transition={WINDOW_CONTENT_TRANSITION}
        className="flex h-full flex-col"
      >
        <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 bg-surface-raised px-3 py-2">
          <h2
            id={titleId}
            className={cn(
              'col-start-2 text-sm font-semibold transition-colors duration-200 motion-reduce:transition-none',
              !isFocused && 'text-muted',
            )}
          >
            {title}
          </h2>
          <div
            className="flex justify-end gap-2"
            onPointerDown={(event) => {
              event.stopPropagation();
            }}
          >
            <WindowControl
              label={`Minimizar ${title}`}
              iconPath={MINIMIZE_ICON_PATH}
              onClick={onMinimize}
            />
            <WindowControl label={`Cerrar ${title}`} iconPath={CLOSE_ICON_PATH} onClick={onClose} />
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-auto p-5 sm:p-6">{children}</div>
      </motion.div>
    </motion.section>
  );
}
