import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { APPS, DOCK_ID } from '../util/apps';
import { Dock, type DockItem } from './Dock';

const buildItems = (overrides: Partial<Record<string, Partial<DockItem>>> = {}): DockItem[] =>
  [APPS.projects, APPS.terminal].map((app) => ({
    app,
    isRunning: false,
    isFocused: false,
    ...overrides[app.id],
  }));

describe('Dock', () => {
  it('links every app to its route', () => {
    render(<Dock items={buildItems()} currentHref="/" onActivate={jest.fn()} />);

    expect(screen.getByRole('link', { name: 'Proyectos' })).toHaveAttribute('href', '/projects');
    expect(screen.getByRole('link', { name: 'Pregúntale a mi IA' })).toHaveAttribute(
      'href',
      '/terminal',
    );
  });

  it('announces which apps are running', () => {
    render(
      <Dock
        currentHref="/"
        items={buildItems({ terminal: { isRunning: true } })}
        onActivate={jest.fn()}
      />,
    );

    expect(screen.getByRole('link', { name: 'Pregúntale a mi IA, abierta' })).toBeInTheDocument();
  });

  it('marks the focused app as the current page', () => {
    render(
      <Dock
        currentHref="/"
        items={buildItems({ projects: { isRunning: true, isFocused: true } })}
        onActivate={jest.fn()}
      />,
    );

    expect(screen.getByRole('link', { name: 'Proyectos, abierta' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('reports the activated app', async () => {
    const user = userEvent.setup();
    const onActivate = jest.fn();
    render(<Dock currentHref="/" items={buildItems()} onActivate={onActivate} />);

    await user.click(screen.getByRole('link', { name: 'Pregúntale a mi IA' }));

    expect(onActivate).toHaveBeenCalledWith('terminal');
  });

  describe('navigating', () => {
    /** Whether the click was left to navigate, seen before the test setup cancels it. */
    async function clickAndSeeIfItNavigates(currentHref: string): Promise<boolean> {
      const user = userEvent.setup();
      let wasPrevented = false;
      const watch = (event: MouseEvent): void => {
        wasPrevented = event.defaultPrevented;
      };
      document.body.addEventListener('click', watch);
      render(<Dock currentHref={currentHref} items={buildItems()} onActivate={jest.fn()} />);

      await user.click(screen.getByRole('link', { name: 'Proyectos' }));
      document.body.removeEventListener('click', watch);

      return !wasPrevented;
    }

    it('navigates to the route of an app from another route', async () => {
      expect(await clickAndSeeIfItNavigates('/')).toBe(true);
    });

    it('does not navigate to the route the router is already on', async () => {
      expect(await clickAndSeeIfItNavigates('/projects')).toBe(false);
    });
  });

  it('takes a double click as a single activation', async () => {
    const user = userEvent.setup();
    const onActivate = jest.fn();
    render(<Dock currentHref="/" items={buildItems()} onActivate={onActivate} />);

    await user.dblClick(screen.getByRole('link', { name: 'Pregúntale a mi IA' }));

    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it('shows the short name of the app under its icon', () => {
    render(<Dock currentHref="/" items={buildItems()} onActivate={jest.fn()} />);

    expect(screen.getByText('Mi IA')).toBeVisible();
  });

  it('names each link with the full name of its app, which contains the short one', () => {
    render(<Dock currentHref="/" items={buildItems()} onActivate={jest.fn()} />);

    expect(screen.getByRole('link', { name: 'Pregúntale a mi IA' })).toHaveTextContent('Mi IA');
  });

  it('gives the tour an anchor on the whole dock', () => {
    render(<Dock currentHref="/" items={buildItems()} onActivate={jest.fn()} />);

    expect(document.getElementById(DOCK_ID)).toBe(screen.getByRole('list'));
  });
});
