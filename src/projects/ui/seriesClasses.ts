interface SeriesClasses {
  /** Start of a gradient: pair it with a `bg-linear-*` and a `to-*` utility. */
  gradientFrom: string;
  text: string;
}

/** Literal class names, one per `--color-series-*` token, so Tailwind can see them. */
const SERIES: readonly SeriesClasses[] = [
  { gradientFrom: 'from-series-1', text: 'text-series-1' },
  { gradientFrom: 'from-series-2', text: 'text-series-2' },
  { gradientFrom: 'from-series-3', text: 'text-series-3' },
  { gradientFrom: 'from-series-4', text: 'text-series-4' },
  { gradientFrom: 'from-series-5', text: 'text-series-5' },
  { gradientFrom: 'from-series-6', text: 'text-series-6' },
  { gradientFrom: 'from-series-7', text: 'text-series-7' },
  { gradientFrom: 'from-series-8', text: 'text-series-8' },
];

const FALLBACK: SeriesClasses = { gradientFrom: 'from-primary', text: 'text-primary' };

/** Color of the item at `index`; the palette repeats past its last color. */
export function getSeriesClasses(index: number): SeriesClasses {
  return SERIES[index % SERIES.length] ?? FALLBACK;
}
