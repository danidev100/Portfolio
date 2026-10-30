import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ProjectsPhoneApp } from './ProjectsPhoneApp';

const PATHNAME = '/projects';
let mockSearch = '';

// Next keeps `useSearchParams` in step with `history.pushState`; here the
// test sets the query and re-renders, as the router would.
jest.mock('next/navigation', () => ({
  usePathname: () => PATHNAME,
  useSearchParams: () => new URLSearchParams(mockSearch),
}));

function renderApp(search = ''): {
  user: ReturnType<typeof userEvent.setup>;
  navigateTo: (nextSearch: string) => void;
} {
  mockSearch = search;
  const { rerender } = render(<ProjectsPhoneApp />);

  return {
    user: userEvent.setup(),
    navigateTo: (nextSearch) => {
      mockSearch = nextSearch;
      rerender(<ProjectsPhoneApp />);
    },
  };
}

describe('ProjectsPhoneApp', () => {
  let pushState: jest.SpyInstance;
  let replaceState: jest.SpyInstance;
  let back: jest.SpyInstance;

  beforeEach(() => {
    pushState = jest.spyOn(window.history, 'pushState').mockImplementation(() => undefined);
    replaceState = jest.spyOn(window.history, 'replaceState').mockImplementation(() => undefined);
    back = jest.spyOn(window.history, 'back').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('groups live work before ideas', () => {
    renderApp();

    const live = screen.getByRole('region', { name: 'En producción' });
    const ideas = screen.getByRole('region', { name: 'Ideas' });

    expect(within(live).getByRole('button', { name: /NEXA.*En producción/ })).toBeInTheDocument();
    expect(
      within(ideas).getByRole('button', { name: /Factura Lens.*Idea 01/ }),
    ).toBeInTheDocument();
  });

  it('pushes the project into the history', async () => {
    const { user } = renderApp();

    await user.click(screen.getByRole('button', { name: /NEXA/ }));

    expect(pushState).toHaveBeenCalledWith(null, '', '?project=nexa');
  });

  it('pushes a double-tapped project once', async () => {
    const { user } = renderApp();

    await user.dblClick(screen.getByRole('button', { name: /NEXA/ }));

    expect(pushState).toHaveBeenCalledTimes(1);
  });

  it('shows the project named in the url', () => {
    renderApp('project=nexa');

    const detail = screen.getByRole('dialog', { name: 'NEXA' });

    expect(within(detail).getByRole('link', { name: /Ver el sitio en vivo/ })).toHaveAttribute(
      'href',
      'https://nexa-landing.onrender.com',
    );
    expect(within(detail).getByRole('button', { name: 'Proyectos' })).toBeInTheDocument();
  });

  // No test browser emulates safe-area insets: the classes are what can be checked.
  it('keeps a project clear of the side safe areas when turned sideways', () => {
    renderApp('project=nexa');

    const { className } = screen.getByRole('dialog', { name: 'NEXA' });

    expect(className).toMatch(/\bpl-\[[^\]]*env\(safe-area-inset-left\)/);
    expect(className).toMatch(/\bpr-\[[^\]]*env\(safe-area-inset-right\)/);
  });

  it('ignores an unknown project', () => {
    renderApp('project=foo');

    expect(screen.getByRole('region', { name: 'Ideas' })).toBeInTheDocument();
  });

  it('goes back in the history after opening here', async () => {
    const { user, navigateTo } = renderApp();

    await user.click(screen.getByRole('button', { name: /NEXA/ }));
    navigateTo('project=nexa');
    await user.click(screen.getByRole('button', { name: 'Proyectos' }));

    expect(back).toHaveBeenCalled();
    expect(replaceState).not.toHaveBeenCalled();
  });

  it('replaces the url on a direct entry', async () => {
    const { user } = renderApp('project=nexa');

    await user.click(screen.getByRole('button', { name: 'Proyectos' }));

    expect(replaceState).toHaveBeenCalledWith(null, '', PATHNAME);
    expect(back).not.toHaveBeenCalled();
  });
});
