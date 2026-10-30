import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { AppId } from '@/shared/util/apps';

import { Phone } from './Phone';

let mockPathname = '/';
const mockBack = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ back: mockBack }),
}));

const APP_CONTENT: Record<AppId, string> = {
  projects: 'Contenido de proyectos',
  terminal: 'Contenido de la IA',
  about: 'Contenido del perfil',
  contact: 'Contenido de contacto',
};

function renderPhone(pathname: string): { goTo: (nextPathname: string) => void } {
  mockPathname = pathname;
  const { rerender } = render(<Phone flavor="ios" appContent={APP_CONTENT} />);

  return {
    goTo: (nextPathname) => {
      mockPathname = nextPathname;
      rerender(<Phone flavor="ios" appContent={APP_CONTENT} />);
    },
  };
}

/** Whether the click was left to navigate, seen before the test setup cancels it. */
async function clickAndSeeIfItNavigates(element: HTMLElement): Promise<boolean> {
  const user = userEvent.setup();
  let wasPrevented = false;
  const watch = (event: MouseEvent): void => {
    wasPrevented = event.defaultPrevented;
  };
  document.body.addEventListener('click', watch);
  await user.click(element);
  document.body.removeEventListener('click', watch);

  return !wasPrevented;
}

describe('Phone', () => {
  beforeEach(() => {
    mockBack.mockClear();
  });

  it('shows the home screen on /', () => {
    renderPhone('/');

    expect(screen.getByRole('navigation', { name: 'Dock' })).toBeInTheDocument();
  });

  it('opens the app named by the route', () => {
    renderPhone('/projects');

    expect(screen.getByRole('heading', { level: 1, name: 'Proyectos' })).toBeInTheDocument();
    expect(screen.getByText('Contenido de proyectos')).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Dock' })).not.toBeInTheDocument();
  });

  it('goes back to the home screen it came from', async () => {
    const user = userEvent.setup();
    const { goTo } = renderPhone('/');

    await user.click(
      within(screen.getByRole('navigation', { name: 'Dock' })).getByRole('link', {
        name: 'Proyectos',
      }),
    );
    goTo('/projects');

    expect(await clickAndSeeIfItNavigates(screen.getByRole('link', { name: 'Inicio' }))).toBe(
      false,
    );
    expect(mockBack).toHaveBeenCalled();
  });

  it('navigates home on a direct entry', async () => {
    renderPhone('/projects');

    expect(await clickAndSeeIfItNavigates(screen.getByRole('link', { name: 'Inicio' }))).toBe(true);
    expect(mockBack).not.toHaveBeenCalled();
  });

  it('navigates home after moving to another app inside an app', async () => {
    const user = userEvent.setup();
    const { goTo } = renderPhone('/');

    await user.click(
      within(screen.getByRole('navigation', { name: 'Dock' })).getByRole('link', {
        name: 'Perfil y CV',
      }),
    );
    goTo('/about');
    goTo('/contact');

    expect(await clickAndSeeIfItNavigates(screen.getByRole('link', { name: 'Inicio' }))).toBe(true);
    expect(mockBack).not.toHaveBeenCalled();
  });

  it('takes a double tap on «Inicio» as a single trip home', async () => {
    const user = userEvent.setup();
    const { goTo } = renderPhone('/');
    await user.click(
      within(screen.getByRole('navigation', { name: 'Dock' })).getByRole('link', {
        name: 'Proyectos',
      }),
    );
    goTo('/projects');
    let wasLastClickPrevented = false;
    const watch = (event: MouseEvent): void => {
      wasLastClickPrevented = event.defaultPrevented;
    };
    document.body.addEventListener('click', watch);

    await user.dblClick(screen.getByRole('link', { name: 'Inicio' }));
    document.body.removeEventListener('click', watch);

    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(wasLastClickPrevented).toBe(true);
  });
});
