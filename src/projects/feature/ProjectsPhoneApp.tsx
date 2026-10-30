'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, type ReactNode } from 'react';

import { getProjectRowId, ProjectList } from '../ui/ProjectList';
import { ProjectScreen } from '../ui/ProjectScreen';
import { getProjectLabel } from '../util/projectLabels';
import { PROJECTS } from '../util/projects';

/** `?project=<id>` names the project on screen, so the back gesture closes it. */
const PROJECT_PARAM = 'project';

/**
 * Projects on the phone: a list, and a project pushed over it. The project is
 * in the URL through `history.pushState`, which Next keeps in step with
 * `useSearchParams`, so the browser's back gesture pops it like a native app.
 */
export function ProjectsPhoneApp(): ReactNode {
  const pathname = usePathname();
  const openId = useSearchParams().get(PROJECT_PARAM);
  const openProject = PROJECTS.find((project) => project.id === openId);
  /** Whether this app pushed the project, so there is a list to go back to in the history. */
  const hasPushedRef = useRef(false);
  const lastOpenedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (openProject) {
      lastOpenedIdRef.current = openProject.id;

      return;
    }
    // The project screen took the focus with it: give it back to its row.
    if (lastOpenedIdRef.current) {
      document.getElementById(getProjectRowId(lastOpenedIdRef.current))?.focus();
    }
  }, [openProject]);

  const open = (id: string): void => {
    if (id === openId) return;

    hasPushedRef.current = true;
    const query = new URLSearchParams({ [PROJECT_PARAM]: id });
    window.history.pushState(null, '', `?${query.toString()}`);
  };

  const back = (): void => {
    if (hasPushedRef.current) {
      hasPushedRef.current = false;
      window.history.back();

      return;
    }
    // Entered straight on a project: there is no list below it in the history.
    window.history.replaceState(null, '', pathname);
  };

  return (
    <>
      <ProjectList projects={PROJECTS} onOpen={open} />
      {openProject ? (
        <ProjectScreen
          project={openProject}
          label={getProjectLabel(openProject, PROJECTS)}
          onBack={back}
        />
      ) : null}
    </>
  );
}
