import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TopBar } from './TopBar';

describe('TopBar', () => {
  it('toggles the activities overview from its button', async () => {
    const user = userEvent.setup();
    const onToggleOverview = jest.fn();
    render(
      <TopBar isOverviewOpen={false} overviewId="overview" onToggleOverview={onToggleOverview} />,
    );

    await user.click(screen.getByRole('button', { name: 'Actividades' }));

    expect(onToggleOverview).toHaveBeenCalledTimes(1);
  });

  it('exposes whether the overview is open', () => {
    render(<TopBar isOverviewOpen overviewId="overview" onToggleOverview={jest.fn()} />);

    const button = screen.getByRole('button', { name: 'Actividades' });

    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(button).toHaveAttribute('aria-controls', 'overview');
  });
});
