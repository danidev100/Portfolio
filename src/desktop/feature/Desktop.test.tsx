import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useWindowStore } from '../data-access/useWindowStore';
import { Desktop } from './Desktop';

jest.mock('next/navigation', () => ({
  usePathname: (): string => '/',
  useRouter: (): { push: jest.Mock; replace: jest.Mock } => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

const APP_CONTENT = {
  projects: <p>Contenido de proyectos</p>,
  terminal: <p>Contenido de terminal</p>,
  about: <p>Contenido de sobre mí</p>,
  contact: <p>Contenido de contacto</p>,
};

function renderDesktop(): ReturnType<typeof userEvent.setup> {
  render(<Desktop appContent={APP_CONTENT} />);

  return userEvent.setup();
}

describe('Desktop', () => {
  beforeEach(() => {
    useWindowStore.setState(useWindowStore.getInitialState(), true);
  });

  it('greets the visitor on an empty desktop', () => {
    renderDesktop();

    expect(screen.getByRole('heading', { level: 1, name: 'Dani OS' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens an app in a window from the dock', async () => {
    const user = renderDesktop();

    await user.click(screen.getByRole('link', { name: 'Sobre mí' }));

    expect(screen.getByRole('dialog', { name: 'Sobre mí' })).toHaveTextContent(
      'Contenido de sobre mí',
    );
  });

  it('keeps several windows open and focuses the last one opened', async () => {
    const user = renderDesktop();

    await user.click(screen.getByRole('link', { name: 'Proyectos' }));
    await user.click(screen.getByRole('link', { name: 'Terminal' }));

    expect(screen.getAllByRole('dialog')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Terminal, abierta' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  // The window leaving the screen is covered in e2e: its exit morphs back into
  // the dock, which needs real layout that jsdom does not have.
  it('stops running an app when its window is closed', async () => {
    const user = renderDesktop();
    await user.click(screen.getByRole('link', { name: 'Proyectos' }));

    await user.click(screen.getByRole('button', { name: 'Cerrar Proyectos' }));

    expect(screen.getByRole('link', { name: 'Proyectos' })).not.toHaveAttribute('aria-current');
  });

  it('keeps a minimized app running but out of focus', async () => {
    const user = renderDesktop();
    await user.click(screen.getByRole('link', { name: 'Proyectos' }));

    await user.click(screen.getByRole('button', { name: 'Minimizar Proyectos' }));

    expect(screen.getByRole('link', { name: 'Proyectos, abierta' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('returns focus to the dock when the last window is closed', async () => {
    const user = renderDesktop();
    await user.click(screen.getByRole('link', { name: 'Proyectos' }));

    await user.click(screen.getByRole('button', { name: 'Cerrar Proyectos' }));

    expect(screen.getByRole('link', { name: 'Proyectos' })).toHaveFocus();
  });

  it('returns focus to the dock when the last window is minimized', async () => {
    const user = renderDesktop();
    await user.click(screen.getByRole('link', { name: 'Contacto' }));

    await user.click(screen.getByRole('button', { name: 'Minimizar Contacto' }));

    expect(screen.getByRole('link', { name: 'Contacto, abierta' })).toHaveFocus();
  });

  it('moves focus to the window left on top when another one is closed', async () => {
    const user = renderDesktop();
    await user.click(screen.getByRole('link', { name: 'Proyectos' }));
    await user.click(screen.getByRole('link', { name: 'Terminal' }));

    await user.click(screen.getByRole('button', { name: 'Cerrar Terminal' }));

    expect(screen.getByRole('dialog', { name: 'Proyectos' })).toHaveFocus();
  });

  it('lists the open windows in the activities overview', async () => {
    const user = renderDesktop();
    await user.click(screen.getByRole('link', { name: 'Proyectos' }));

    await user.click(screen.getByRole('button', { name: 'Actividades' }));

    const overview = screen.getByRole('region', { name: 'Ventanas abiertas' });
    expect(overview).toHaveTextContent('Proyectos');
  });

  it('closes the activities overview with Escape', async () => {
    const user = renderDesktop();
    await user.click(screen.getByRole('button', { name: 'Actividades' }));

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('region', { name: 'Ventanas abiertas' })).not.toBeInTheDocument();
    });
  });

  it('closes the activities overview when an app is activated', async () => {
    const user = renderDesktop();
    await user.click(screen.getByRole('button', { name: 'Actividades' }));

    await user.click(screen.getByRole('link', { name: 'Contacto' }));

    await waitFor(() => {
      expect(screen.queryByRole('region', { name: 'Ventanas abiertas' })).not.toBeInTheDocument();
    });
    expect(screen.getByRole('dialog', { name: 'Contacto' })).toBeInTheDocument();
  });
});
