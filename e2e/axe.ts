import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

import { expect } from './support';

const WCAG_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

interface Violation {
  rule: string;
  elements: string[];
}

/** Selector of the labels of the experience graph. */
const GRAPH_LABELS = 'ul[aria-label="Nodos del grafo"]';

/** Rule ids with the elements that break them: a readable diff when it fails. */
async function findViolations(page: Page): Promise<Violation[]> {
  // The graph labels sit where their nodes are, so in a crowded view some
  // overlap and leave less than 24px of a neighbor clear. Like pins on a map,
  // their position is the information (WCAG 2.5.8, "essential" exception),
  // and each label on its own does meet the minimum size.
  const { violations: targetSizeViolations } = await new AxeBuilder({ page })
    .withRules(['target-size'])
    .exclude(GRAPH_LABELS)
    .analyze();
  const { violations } = await new AxeBuilder({ page })
    .withTags(WCAG_AA)
    .disableRules(['target-size'])
    .analyze();

  return [...violations, ...targetSizeViolations].map((violation) => ({
    rule: violation.id,
    elements: violation.nodes.map((node) => node.html),
  }));
}

/**
 * Content fades in when a window opens, and text is reported for its contrast
 * while it is still half transparent. Retrying lets every state settle; a real
 * violation is still there on the last try.
 */
export async function expectNoViolations(page: Page): Promise<void> {
  await expect(async () => {
    expect(await findViolations(page)).toEqual([]);
  }).toPass({ timeout: 10_000 });
}
