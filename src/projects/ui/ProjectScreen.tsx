import { useEffect, useId, useRef, type ReactNode } from 'react';

import type { Project } from '../util/projects';
import { ProjectFacts } from './ProjectFacts';

interface ProjectScreenProps {
  project: Project;
  /** What the project is: published work or a numbered idea. */
  label: string;
  onBack: () => void;
}

/**
 * A project pushed over the whole phone screen, with its own bar back to the
 * list, as a native app pushes a detail over its navigation bar.
 */
export function ProjectScreen({ project, label, onBack }: ProjectScreenProps): ReactNode {
  const nameId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Modal, so the list and the app's bar beneath it are inert: neither the
  // keyboard nor a screen reader can reach what the project covers.
  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={nameId}
      onCancel={(event) => {
        // Escape goes back through the history, like the back button.
        event.preventDefault();
        onBack();
      }}
      className="m-0 flex h-dvh max-h-none w-full max-w-none flex-col overflow-y-auto bg-canvas px-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] text-foreground"
    >
      <div className="flex h-11 shrink-0 items-center">
        <button
          // A modal dialog moves the focus into itself; this names where it lands.
          autoFocus
          type="button"
          onClick={onBack}
          className="-ml-2 flex min-h-11 items-center gap-1 rounded-full px-2 text-primary android:size-12 android:justify-center android:px-0 android:text-foreground"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 12 20"
            className="h-5 w-3 android:hidden"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 2 2 10l8 8" />
          </svg>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="hidden size-6 android:block"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {/* Android shows only the arrow; the name stays for screen readers. */}
          <span className="android:sr-only">Proyectos</span>
        </button>
      </div>
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex flex-col gap-1">
          <p className="font-mono text-xs tracking-wider text-muted uppercase">{label}</p>
          <h2 id={nameId} className="font-display text-3xl font-bold">
            {project.name}
          </h2>
        </div>
        <ProjectFacts project={project} />
      </div>
    </dialog>
  );
}
