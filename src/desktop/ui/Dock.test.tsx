import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { APPS } from '../util/apps';
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
    render(<Dock items={buildItems()} onActivate={jest.fn()} />);

    expect(screen.getByRole('link', { name: 'Proyectos' })).toHaveAttribute('href', '/projects');
    expect(screen.getByRole('link', { name: 'Terminal' })).toHaveAttribute('href', '/terminal');
  });

  it('announces which apps are running', () => {
    render(<Dock items={buildItems({ terminal: { isRunning: true } })} onActivate={jest.fn()} />);

    expect(screen.getByRole('link', { name: 'Terminal, abierta' })).toBeInTheDocument();
  });

  it('marks the focused app as the current page', () => {
    render(
      <Dock
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
    render(<Dock items={buildItems()} onActivate={onActivate} />);

    await user.click(screen.getByRole('link', { name: 'Terminal' }));

    expect(onActivate).toHaveBeenCalledWith('terminal');
  });
});
