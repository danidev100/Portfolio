import type { Project } from './projects';

const IDEA_NUMBER_DIGITS = 2;
const LIVE_LABEL = 'En producción';

/**
 * What a project is, said on its card and on its case: published work, or an
 * idea with its number among the ideas (`Idea 01`, `Idea 02`…).
 */
export function getProjectLabel(project: Project, projects: readonly Project[]): string {
  if (project.status === 'live') return LIVE_LABEL;

  const ideas = projects.filter((candidate) => candidate.status === 'idea');
  const ideaNumber = ideas.findIndex((idea) => idea.id === project.id) + 1;

  return `Idea ${String(ideaNumber).padStart(IDEA_NUMBER_DIGITS, '0')}`;
}
