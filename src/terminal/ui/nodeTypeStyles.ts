import type { GraphNodeType } from '../util/graph';

interface NodeTypeStyle {
  /** Shown in the legend. */
  name: string;
  /** Token the 3D materials read their color from. */
  colorVariable: string;
  /** Literal class names for the same color, so Tailwind can see them. */
  dotClass: string;
  borderClass: string;
  /** Radius of the node's sphere, in world units. */
  size: number;
  /** Keeps its label even where there is no room for all of them. */
  isLandmark: boolean;
}

export const NODE_TYPE_STYLES: Readonly<Record<GraphNodeType, NodeTypeStyle>> = {
  core: {
    name: 'Dani',
    colorVariable: '--color-foreground',
    dotClass: 'bg-foreground',
    borderClass: 'border-foreground/60',
    size: 0.32,
    isLandmark: true,
  },
  experience: {
    name: 'Experiencia',
    colorVariable: '--color-highlight',
    dotClass: 'bg-highlight',
    borderClass: 'border-highlight/60',
    size: 0.2,
    isLandmark: true,
  },
  skill: {
    name: 'Habilidad',
    colorVariable: '--color-primary',
    dotClass: 'bg-primary',
    borderClass: 'border-primary/60',
    size: 0.13,
    isLandmark: false,
  },
  ai: {
    name: 'IA',
    colorVariable: '--color-ai',
    dotClass: 'bg-ai',
    borderClass: 'border-ai/60',
    size: 0.13,
    isLandmark: false,
  },
  achievement: {
    name: 'Logro',
    colorVariable: '--color-positive',
    dotClass: 'bg-positive',
    borderClass: 'border-positive/60',
    size: 0.13,
    isLandmark: false,
  },
};

/** The types a visitor needs told apart; the core node explains itself. */
export const LEGEND_TYPES: readonly GraphNodeType[] = ['experience', 'skill', 'ai', 'achievement'];
