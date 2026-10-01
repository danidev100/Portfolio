import { getIdeaLabel } from './projectLabels';

describe('getIdeaLabel', () => {
  it('numbers the ideas from one, padded to two digits', () => {
    expect(getIdeaLabel(0)).toBe('Idea 01');
    expect(getIdeaLabel(9)).toBe('Idea 10');
  });
});
