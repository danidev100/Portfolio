const IDEA_NUMBER_DIGITS = 2;

/** `Idea 01`, `Idea 02`… The projects are ideas, and the label says so. */
export function getIdeaLabel(index: number): string {
  return `Idea ${String(index + 1).padStart(IDEA_NUMBER_DIGITS, '0')}`;
}
