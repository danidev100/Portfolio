import { getAppIdByPathname } from './apps';

describe('getAppIdByPathname', () => {
  it('resolves the app that owns a route', () => {
    expect(getAppIdByPathname('/projects')).toBe('projects');
  });

  it('is null for the desktop route', () => {
    expect(getAppIdByPathname('/')).toBeNull();
  });

  it('is null for an unknown route', () => {
    expect(getAppIdByPathname('/settings')).toBeNull();
  });
});
