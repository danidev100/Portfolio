import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { PhoneFlavor } from '@/shared/util/deviceProfile';

import { HomeScreen } from './HomeScreen';

const getDock = (): HTMLElement => screen.getByRole('navigation', { name: 'Dock' });

function renderHome(currentHref = '/', flavor: PhoneFlavor = 'ios'): { onOpenApp: jest.Mock } {
  const onOpenApp = jest.fn();
  render(<HomeScreen flavor={flavor} currentHref={currentHref} onOpenApp={onOpenApp} />);

  return { onOpenApp };
}

describe('HomeScreen', () => {
  it('docks the four apps', () => {
    renderHome();

    const links = within(getDock()).getAllByRole('link');

    expect(
      links.map((link) => [link.getAttribute('aria-label'), link.getAttribute('href')]),
    ).toEqual([
      ['Proyectos', '/projects'],
      ['Pregúntale a mi IA', '/terminal'],
      ['Perfil y CV', '/about'],
      ['Contacto', '/contact'],
    ]);
  });

  it('opens an app from the dock', async () => {
    const user = userEvent.setup();
    const { onOpenApp } = renderHome();

    await user.click(within(getDock()).getByRole('link', { name: 'Proyectos' }));

    expect(onOpenApp).toHaveBeenCalledWith('projects');
  });

  it('does not navigate to the route the router is on', async () => {
    const user = userEvent.setup();
    let wasPrevented = false;
    const watch = (event: MouseEvent): void => {
      wasPrevented = event.defaultPrevented;
    };
    document.body.addEventListener('click', watch);
    const { onOpenApp } = renderHome('/terminal');

    await user.click(within(getDock()).getByRole('link', { name: 'Pregúntale a mi IA' }));
    document.body.removeEventListener('click', watch);

    expect(wasPrevented).toBe(true);
    expect(onOpenApp).toHaveBeenCalledWith('terminal');
  });

  it('ignores the second click of a double click', async () => {
    const user = userEvent.setup();
    const { onOpenApp } = renderHome();

    await user.dblClick(within(getDock()).getByRole('link', { name: 'Contacto' }));

    expect(onOpenApp).toHaveBeenCalledTimes(1);
  });

  it('opens the profile from the cv launcher', async () => {
    const user = userEvent.setup();
    const { onOpenApp } = renderHome();

    await user.click(
      within(screen.getByRole('navigation', { name: 'Apps' })).getByRole('link', { name: 'CV' }),
    );

    expect(onOpenApp).toHaveBeenCalledWith('about');
  });

  it('puts the android apps and dock at the bottom, above the ai bar', () => {
    renderHome('/', 'android');

    const names = screen
      .getAllByRole('link')
      .map((link) => link.getAttribute('aria-label') ?? link.textContent);

    expect(names.slice(-6)).toEqual([
      'CV',
      'Proyectos',
      'Pregúntale a mi IA',
      'Perfil y CV',
      'Contacto',
      'Pregúntale a mi IA',
    ]);
  });

  it("labels the android dock with each app's short title", () => {
    renderHome('/', 'android');

    expect(
      within(getDock())
        .getAllByRole('link')
        .map((link) => link.textContent),
    ).toEqual(['Proyectos', 'Mi IA', 'Perfil', 'Contacto']);
  });

  it('keeps the ios pill above the dock', () => {
    renderHome();

    const pill = screen.getByText('Pregúntale a mi IA');
    const firstDockLink = within(getDock()).getAllByRole('link')[0];

    expect(firstDockLink).toBeDefined();
    expect(pill.compareDocumentPosition(firstDockLink as Node)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });
});
