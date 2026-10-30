import { render } from '@testing-library/react';

import { AppGlyph, type AppGlyphId } from './AppGlyph';

const GLYPH_IDS: readonly AppGlyphId[] = [
  'projects',
  'terminal',
  'about',
  'contact',
  'guide',
  'cv',
];

describe('AppGlyph', () => {
  it.each(GLYPH_IDS)('draws the %s glyph', (glyph) => {
    const { container } = render(<AppGlyph glyph={glyph} />);
    const svg = container.querySelector('svg');

    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg?.childElementCount).toBeGreaterThan(0);
  });
});
