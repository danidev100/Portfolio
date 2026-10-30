import { shouldActivateFromClick, type AppLinkClick } from './appLinks';

function buildClick(detail = 1): AppLinkClick & { isPrevented: () => boolean } {
  let isPrevented = false;

  return {
    detail,
    preventDefault: () => {
      isPrevented = true;
    },
    isPrevented: () => isPrevented,
  };
}

describe('shouldActivateFromClick', () => {
  it('activates the app and lets the link navigate to another route', () => {
    const click = buildClick();

    expect(shouldActivateFromClick(click, '/projects', '/')).toBe(true);
    expect(click.isPrevented()).toBe(false);
  });

  it('activates the app without navigating to the route it is already on', () => {
    const click = buildClick();

    expect(shouldActivateFromClick(click, '/projects', '/projects')).toBe(true);
    expect(click.isPrevented()).toBe(true);
  });

  it('ignores the second click of a double click', () => {
    const click = buildClick(2);

    expect(shouldActivateFromClick(click, '/projects', '/')).toBe(false);
    expect(click.isPrevented()).toBe(true);
  });

  it('treats a keyboard activation, which has no click count, as a single click', () => {
    const click = buildClick(0);

    expect(shouldActivateFromClick(click, '/projects', '/')).toBe(true);
  });
});
