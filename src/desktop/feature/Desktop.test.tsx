import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ONBOARDING_STORAGE_KEY } from '../data-access/onboardingStorage';
import { useWindowStore } from '../data-access/useWindowStore';
import { Desktop } from './Desktop';

let mockPathname = '/';

jest.mock('next/navigation', () => ({
  usePathname: (): string => mockPathname,
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

/** A link in the dock. Scoped, because the desktop greeting links to the same apps. */
const dockLink = (name: string): HTMLElement =>
  within(screen.getByRole('navigation', { name: 'Dock' })).getByRole('link', { name });

describe('Desktop', () => {
  beforeEach(() => {
    mockPathname = '/';
    useWindowStore.setState(useWindowStore.getInitialState(), true);
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, 'seen');
  });

  it('greets the visitor on an empty desktop', () => {
    renderDesktop();

    expect(screen.getByRole('heading', { level: 1, name: 'Daniel Jaramillo' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the profile from the greeting', async () => {
    const user = renderDesktop();

    await user.click(screen.getByRole('link', { name: 'Ver mi perfil y CV' }));

    expect(screen.getByRole('dialog', { name: 'Perfil y CV' })).toBeInTheDocument();
  });

  it('opens an app in a window from the dock', async () => {
    const user = renderDesktop();

    await user.click(dockLink('Perfil y CV'));

    expect(screen.getByRole('dialog', { name: 'Perfil y CV' })).toHaveTextContent(
      'Contenido de sobre mí',
    );
  });

  it('keeps several windows open and focuses the last one opened', async () => {
    const user = renderDesktop();

    await user.click(dockLink('Proyectos'));
    await user.click(dockLink('Pregúntale a mi IA'));

    expect(screen.getAllByRole('dialog')).toHaveLength(2);
    expect(dockLink('Pregúntale a mi IA, abierta')).toHaveAttribute('aria-current', 'page');
  });

  // The window leaving the screen is covered in e2e: its exit morphs back into
  // the dock, which needs real layout that jsdom does not have.
  it('stops running an app when its window is closed', async () => {
    const user = renderDesktop();
    await user.click(dockLink('Proyectos'));

    await user.click(screen.getByRole('button', { name: 'Cerrar Proyectos' }));

    expect(dockLink('Proyectos')).not.toHaveAttribute('aria-current');
  });

  it('keeps a minimized app running but out of focus', async () => {
    const user = renderDesktop();
    await user.click(dockLink('Proyectos'));

    await user.click(screen.getByRole('button', { name: 'Minimizar Proyectos' }));

    expect(dockLink('Proyectos, abierta')).not.toHaveAttribute('aria-current');
  });

  it('returns focus to the dock when the last window is closed', async () => {
    const user = renderDesktop();
    await user.click(dockLink('Proyectos'));

    await user.click(screen.getByRole('button', { name: 'Cerrar Proyectos' }));

    expect(dockLink('Proyectos')).toHaveFocus();
  });

  it('returns focus to the dock when the last window is minimized', async () => {
    const user = renderDesktop();
    await user.click(dockLink('Contacto'));

    await user.click(screen.getByRole('button', { name: 'Minimizar Contacto' }));

    expect(dockLink('Contacto, abierta')).toHaveFocus();
  });

  it('moves focus to the window left on top when another one is closed', async () => {
    const user = renderDesktop();
    await user.click(dockLink('Proyectos'));
    await user.click(dockLink('Pregúntale a mi IA'));

    await user.click(screen.getByRole('button', { name: 'Cerrar Pregúntale a mi IA' }));

    expect(screen.getByRole('dialog', { name: 'Proyectos' })).toHaveFocus();
  });

  it('minimizes the focused app from its own dock icon', async () => {
    mockPathname = '/projects';
    const user = renderDesktop();
    const dockIcon = dockLink('Proyectos, abierta');
    expect(dockIcon).toHaveAttribute('aria-current', 'page');

    await user.click(dockIcon);

    expect(dockLink('Proyectos, abierta')).not.toHaveAttribute('aria-current');
  });

  it('restores a minimized app from its dock icon even on its own route', async () => {
    mockPathname = '/projects';
    const user = renderDesktop();
    await user.click(screen.getByRole('button', { name: 'Minimizar Proyectos' }));

    await user.click(dockLink('Proyectos, abierta'));

    expect(dockLink('Proyectos, abierta')).toHaveAttribute('aria-current', 'page');
  });

  it('lists the open windows in the activities overview', async () => {
    const user = renderDesktop();
    await user.click(dockLink('Proyectos'));

    await user.click(screen.getByRole('button', { name: 'Ventanas' }));

    const overview = screen.getByRole('region', { name: 'Ventanas abiertas' });
    expect(overview).toHaveTextContent('Proyectos');
  });

  it('closes the activities overview with Escape', async () => {
    const user = renderDesktop();
    await user.click(screen.getByRole('button', { name: 'Ventanas' }));

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('region', { name: 'Ventanas abiertas' })).not.toBeInTheDocument();
    });
  });

  it('closes the activities overview when an app is activated', async () => {
    const user = renderDesktop();
    await user.click(screen.getByRole('button', { name: 'Ventanas' }));

    await user.click(dockLink('Contacto'));

    await waitFor(() => {
      expect(screen.queryByRole('region', { name: 'Ventanas abiertas' })).not.toBeInTheDocument();
    });
    expect(screen.getByRole('dialog', { name: 'Contacto' })).toBeInTheDocument();
  });

  describe('onboarding tour', () => {
    const FIRST_STEP = 'Empieza por aquí';

    it('greets a first visit with the tour', async () => {
      window.localStorage.removeItem(ONBOARDING_STORAGE_KEY);
      renderDesktop();

      expect(
        await screen.findByRole('dialog', { name: FIRST_STEP }, { timeout: 2000 }),
      ).toBeInTheDocument();
    });

    it('relaunches the tour from «Guía»', async () => {
      const user = renderDesktop();

      await user.click(screen.getByRole('button', { name: 'Guía' }));

      expect(await screen.findByRole('dialog', { name: FIRST_STEP })).toBeInTheDocument();
    });

    it('closes the windows overview to make room for the tour', async () => {
      const user = renderDesktop();
      await user.click(screen.getByRole('button', { name: 'Ventanas' }));

      await user.click(screen.getByRole('button', { name: 'Guía' }));

      await waitFor(() => {
        expect(screen.queryByRole('region', { name: 'Ventanas abiertas' })).not.toBeInTheDocument();
      });
    });

    it('ends the tour when an app is opened from the dock', async () => {
      const user = renderDesktop();
      await user.click(screen.getByRole('button', { name: 'Guía' }));
      await screen.findByRole('dialog', { name: FIRST_STEP });

      await user.click(dockLink('Perfil y CV'));

      await waitFor(() => {
        expect(screen.queryByRole('dialog', { name: FIRST_STEP })).not.toBeInTheDocument();
      });
      expect(screen.getByRole('dialog', { name: 'Perfil y CV' })).toBeInTheDocument();
    });

    it('opens the profile from the last step', async () => {
      const user = renderDesktop();
      await user.click(screen.getByRole('button', { name: 'Guía' }));
      await screen.findByRole('dialog', { name: FIRST_STEP });

      await user.click(screen.getByRole('button', { name: 'Siguiente' }));
      await user.click(screen.getByRole('button', { name: 'Siguiente' }));
      const lastStep = await screen.findByRole('dialog', { name: 'Habla con mi IA' });
      await user.click(within(lastStep).getByRole('link', { name: 'Ver mi perfil y CV' }));

      expect(screen.getByRole('dialog', { name: 'Perfil y CV' })).toBeInTheDocument();
    });
  });
});
