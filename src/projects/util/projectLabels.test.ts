import { getProjectLabel } from './projectLabels';
import type { Project } from './projects';

const buildProject = (overrides: Partial<Project> = {}): Project => ({
  id: 'project',
  name: 'Project',
  status: 'idea',
  summary: '',
  audience: '',
  aiRole: '',
  stack: [],
  value: '',
  ...overrides,
});

describe('getProjectLabel', () => {
  it('says that a live project is in production', () => {
    const live = buildProject({ id: 'live', status: 'live' });

    expect(getProjectLabel(live, [live])).toBe('En producción');
  });

  it('numbers the ideas from one, padded to two digits', () => {
    const ideas = Array.from({ length: 10 }, (_, index) => buildProject({ id: String(index) }));

    expect(ideas.map((idea) => getProjectLabel(idea, ideas))).toEqual([
      'Idea 01',
      'Idea 02',
      'Idea 03',
      'Idea 04',
      'Idea 05',
      'Idea 06',
      'Idea 07',
      'Idea 08',
      'Idea 09',
      'Idea 10',
    ]);
  });

  it('does not count live projects when numbering the ideas', () => {
    const live = buildProject({ id: 'live', status: 'live' });
    const idea = buildProject({ id: 'idea' });

    expect(getProjectLabel(idea, [live, idea])).toBe('Idea 01');
  });
});
