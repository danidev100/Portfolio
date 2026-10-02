import { settleLanding } from './routeLandings';

describe('settleLanding', () => {
  it('is external when the app did not ask for that route, as with the back button', () => {
    expect(settleLanding([], '/projects').landing).toBe('external');
  });

  it('forgets what the app had asked for when an external navigation lands', () => {
    expect(settleLanding(['/terminal'], '/projects')).toEqual({
      landing: 'external',
      outstanding: [],
    });
  });

  it('is final when the only navigation the app asked for lands', () => {
    expect(settleLanding(['/projects'], '/projects')).toEqual({
      landing: 'final',
      outstanding: [],
    });
  });

  it('is superseded when the app has asked for another route since', () => {
    expect(settleLanding(['/projects', '/'], '/projects')).toEqual({
      landing: 'superseded',
      outstanding: ['/'],
    });
  });

  it('drops the earlier navigations that a later one cancelled before they landed', () => {
    expect(settleLanding(['/projects', '/terminal', '/about'], '/terminal')).toEqual({
      landing: 'superseded',
      outstanding: ['/about'],
    });
  });

  it('counts a route asked for twice in a row as a single navigation', () => {
    expect(settleLanding(['/projects', '/projects'], '/projects')).toEqual({
      landing: 'final',
      outstanding: [],
    });
  });
});
