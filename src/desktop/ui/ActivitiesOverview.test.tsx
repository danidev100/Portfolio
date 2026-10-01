import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { APPS } from '../util/apps';
import { ActivitiesOverview, type OverviewWindow } from './ActivitiesOverview';

const OPEN_WINDOWS: OverviewWindow[] = [
  { app: APPS.projects, isMinimized: false },
  { app: APPS.terminal, isMinimized: true },
];

describe('ActivitiesOverview', () => {
  it('lists the open windows as links to their routes', () => {
    render(<ActivitiesOverview id="overview" windows={OPEN_WINDOWS} onSelect={jest.fn()} />);

    expect(screen.getByRole('link', { name: 'Proyectos' })).toHaveAttribute('href', '/projects');
  });

  it('tells minimized windows apart', () => {
    render(<ActivitiesOverview id="overview" windows={OPEN_WINDOWS} onSelect={jest.fn()} />);

    expect(screen.getByRole('link', { name: 'Terminal, minimizada' })).toBeInTheDocument();
  });

  it('reports the selected window', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    render(<ActivitiesOverview id="overview" windows={OPEN_WINDOWS} onSelect={onSelect} />);

    await user.click(screen.getByRole('link', { name: 'Proyectos' }));

    expect(onSelect).toHaveBeenCalledWith('projects');
  });

  it('explains how to start when no window is open', () => {
    render(<ActivitiesOverview id="overview" windows={[]} onSelect={jest.fn()} />);

    expect(screen.getByText('No hay ventanas abiertas')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
