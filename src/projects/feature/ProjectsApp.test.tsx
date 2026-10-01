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
const expectFrontCard = (name: string): Promise<void> =>
  waitFor(() => {
    expect(getFrontCard()).toHaveAccessibleName(name);
  });

describe('ProjectsApp', () => {
  it('shows every project as a card in the orbit', () => {
    renderApp();

    const cards = within(screen.getByRole('list', { name: 'Proyectos' })).getAllByRole('button');

    expect(cards).toHaveLength(PROJECTS.length);
  });

  it('starts with the first project in front', async () => {
    renderApp();

    await expectFrontCard('Factura Lens');
  });

  it('describes each card with its summary', () => {
    renderApp();

    expect(screen.getByRole('button', { name: 'Solar Scout' })).toHaveAccessibleDescription(
      'Estima el ahorro solar a partir de una factura de energía.',
    );
  });

  it('brings the next project to the front', async () => {
    const user = renderApp();

    await user.click(screen.getByRole('button', { name: 'Proyecto siguiente' }));

    await expectFrontCard('Solar Scout');
  });

  it('wraps to the last project when going back from the first one', async () => {
    const user = renderApp();

    await user.click(screen.getByRole('button', { name: 'Proyecto anterior' }));

    await expectFrontCard('Interview Forge');
  });

  it('turns the orbit with the arrow keys', async () => {
    const user = renderApp();
    getFrontCard().focus();

    await user.keyboard('{ArrowRight}{ArrowRight}');

    await expectFrontCard('DS Copilot');
  });

  it('brings a card to the front when it receives keyboard focus', async () => {
    const user = renderApp();
    getFrontCard().focus();

    await user.tab();

    await expectFrontCard('Solar Scout');
  });

  it('opens the case of a project from its card', async () => {
    const user = renderApp();

    await user.click(screen.getByRole('button', { name: 'DS Copilot' }));

    const detail = await screen.findByRole('region', { name: 'DS Copilot' });
    expect(detail).toHaveTextContent('Equipos con una librería de componentes propia.');
    expect(detail).toHaveTextContent('Storybook');
  });

  it('moves focus into the case when it opens', async () => {
    const user = renderApp();

    await user.click(screen.getByRole('button', { name: 'DS Copilot' }));

    expect(await screen.findByRole('button', { name: 'Volver a la órbita' })).toHaveFocus();
  });

  it('takes the orbit out of reach while a case is open', async () => {
    const user = renderApp();

    await user.click(screen.getByRole('button', { name: 'DS Copilot' }));
    await screen.findByRole('region', { name: 'DS Copilot' });

    expect(screen.getByRole('region', { name: 'Órbita de proyectos' })).toHaveAttribute('inert');
  });

  it('closes the case and gives the orbit back', async () => {
    const user = renderApp();
    await user.click(screen.getByRole('button', { name: 'DS Copilot' }));

    await user.click(await screen.findByRole('button', { name: 'Volver a la órbita' }));

    await waitFor(() => {
      expect(screen.queryByRole('region', { name: 'DS Copilot' })).not.toBeInTheDocument();
    });
    expect(screen.getByRole('region', { name: 'Órbita de proyectos' })).not.toHaveAttribute(
      'inert',
    );
  });

  it('closes the case with Escape', async () => {
    const user = renderApp();
    await user.click(screen.getByRole('button', { name: 'DS Copilot' }));
    await screen.findByRole('region', { name: 'DS Copilot' });

    await user.keyboard('{Escape}');

    expect(screen.getByRole('region', { name: 'Órbita de proyectos' })).not.toHaveAttribute(
      'inert',
    );
  });

  it('returns focus to the card when its case is closed', async () => {
    const user = renderApp();
    await user.click(screen.getByRole('button', { name: 'DS Copilot' }));

    await user.click(await screen.findByRole('button', { name: 'Volver a la órbita' }));

    expect(screen.getByRole('button', { name: 'DS Copilot' })).toHaveFocus();
  });
});
