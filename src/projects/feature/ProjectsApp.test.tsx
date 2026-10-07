import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PROJECTS } from '../util/projects';
import { ProjectsApp } from './ProjectsApp';

function renderApp(): ReturnType<typeof userEvent.setup> {
  render(<ProjectsApp />);

  return userEvent.setup();
}

const getFrontCard = (): HTMLElement =>
  within(screen.getByRole('list', { name: 'Proyectos' })).getByRole('button', { current: true });

/** The ring turns with an animation, so the front card changes a moment later. */
const expectFrontCard = (name: RegExp): Promise<void> =>
  waitFor(() => {
    expect(getFrontCard()).toHaveAccessibleName(name);
  });

describe('ProjectsApp', () => {
  it('shows every project as a card in the orbit', () => {
    renderApp();

    const cards = within(screen.getByRole('list', { name: 'Proyectos' })).getAllByRole('button');

    expect(cards).toHaveLength(PROJECTS.length);
  });

  it('takes the cards that are out of sight out of reach', () => {
    renderApp();

    expect(screen.getByRole('button', { name: /Factura Lens/ }).closest('li')).not.toHaveAttribute(
      'inert',
    );
    expect(screen.getByRole('button', { name: /MFE Atlas/ }).closest('li')).toHaveAttribute(
      'inert',
    );
  });

  it('starts with the first project in front', async () => {
    renderApp();

    await expectFrontCard(/NEXA/);
  });

  it('names each card with everything it shows, summary included', () => {
    renderApp();

    expect(screen.getByRole('button', { name: /Factura Lens/ })).toHaveAccessibleName(
      /Idea 01.*Fotos de facturas convertidas en JSON contable validado con Zod, para PYMES\..*Angular/,
    );
  });

  it('brings the next project to the front', async () => {
    const user = renderApp();

    await user.click(screen.getByRole('button', { name: 'Proyecto siguiente' }));

    await expectFrontCard(/Factura Lens/);
  });

  it('wraps to the last project when going back from the first one', async () => {
    const user = renderApp();

    await user.click(screen.getByRole('button', { name: 'Proyecto anterior' }));

    await expectFrontCard(/Interview Forge/);
  });

  it('turns the orbit with the arrow keys', async () => {
    const user = renderApp();
    getFrontCard().focus();

    await user.keyboard('{ArrowRight}{ArrowRight}');

    await expectFrontCard(/Solar Scout/);
  });

  it('brings a card to the front when it receives keyboard focus', async () => {
    const user = renderApp();
    getFrontCard().focus();

    await user.tab();

    await expectFrontCard(/Factura Lens/);
  });

  it('opens the case of a project from its card', async () => {
    const user = renderApp();

    await user.click(screen.getByRole('button', { name: /Factura Lens/ }));

    const detail = await screen.findByRole('region', { name: 'Factura Lens' });
    expect(detail).toHaveTextContent('PYMES y contadores que aún digitan facturas a mano.');
    expect(detail).toHaveTextContent('BullMQ');
  });

  it('moves focus into the case when it opens', async () => {
    const user = renderApp();

    await user.click(screen.getByRole('button', { name: /Factura Lens/ }));

    expect(await screen.findByRole('button', { name: 'Volver a la órbita' })).toHaveFocus();
  });

  it('takes the orbit out of reach while a case is open', async () => {
    const user = renderApp();

    await user.click(screen.getByRole('button', { name: /Factura Lens/ }));
    await screen.findByRole('region', { name: 'Factura Lens' });

    expect(screen.getByRole('region', { name: 'Órbita de proyectos' })).toHaveAttribute('inert');
  });

  it('closes the case and gives the orbit back', async () => {
    const user = renderApp();
    await user.click(screen.getByRole('button', { name: /Factura Lens/ }));

    await user.click(await screen.findByRole('button', { name: 'Volver a la órbita' }));

    await waitFor(() => {
      expect(screen.queryByRole('region', { name: 'Factura Lens' })).not.toBeInTheDocument();
    });
    expect(screen.getByRole('region', { name: 'Órbita de proyectos' })).not.toHaveAttribute(
      'inert',
    );
  });

  it('closes the case with Escape', async () => {
    const user = renderApp();
    await user.click(screen.getByRole('button', { name: /Factura Lens/ }));
    await screen.findByRole('region', { name: 'Factura Lens' });

    await user.keyboard('{Escape}');

    expect(screen.getByRole('region', { name: 'Órbita de proyectos' })).not.toHaveAttribute(
      'inert',
    );
  });

  it('returns focus to the card when its case is closed', async () => {
    const user = renderApp();
    await user.click(screen.getByRole('button', { name: /Factura Lens/ }));

    await user.click(await screen.findByRole('button', { name: 'Volver a la órbita' }));

    expect(screen.getByRole('button', { name: /Factura Lens/ })).toHaveFocus();
  });

  describe('real projects among the ideas', () => {
    it('puts the live project in front, labelled as in production', async () => {
      renderApp();

      await expectFrontCard(/En producción.*NEXA/);
    });

    it('says that real projects will be added over time', () => {
      renderApp();

      expect(screen.getByText(/iré sumando proyectos reales/)).toBeInTheDocument();
    });

    it('links to the live site from the case of a live project', async () => {
      const user = renderApp();

      await user.click(screen.getByRole('button', { name: /NEXA/ }));
      const detail = await screen.findByRole('region', { name: 'NEXA' });
      const link = within(detail).getByRole('link', { name: /Ver el sitio en vivo/ });

      expect(link).toHaveAttribute('href', 'https://nexa-landing.onrender.com');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAccessibleName(/se abre en una pestaña nueva/);
    });

    it('has no site to link to from the case of an idea', async () => {
      const user = renderApp();

      await user.click(screen.getByRole('button', { name: /Factura Lens/ }));
      const detail = await screen.findByRole('region', { name: 'Factura Lens' });

      expect(within(detail).queryByRole('link')).not.toBeInTheDocument();
    });
  });
});
