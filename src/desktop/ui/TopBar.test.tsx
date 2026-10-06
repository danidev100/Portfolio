import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TopBar } from './TopBar';

describe('TopBar', () => {
  it('toggles the activities overview from its button', async () => {
    const user = userEvent.setup();
    const onToggleOverview = jest.fn();
    render(
      <TopBar
        isOverviewOpen={false}
        overviewId="overview"
        onToggleOverview={onToggleOverview}
        onOpenGuide={jest.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Ventanas' }));

    expect(onToggleOverview).toHaveBeenCalledTimes(1);
  });

  it('exposes whether the overview is open', () => {
    render(
      <TopBar
        isOverviewOpen
        overviewId="overview"
        onToggleOverview={jest.fn()}
        onOpenGuide={jest.fn()}
      />,
    );

    const button = screen.getByRole('button', { name: 'Ventanas' });

    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(button).toHaveAttribute('aria-controls', 'overview');
  });

  it('relaunches the guide from its button', async () => {
    const user = userEvent.setup();
    const onOpenGuide = jest.fn();
    render(
      <TopBar
        isOverviewOpen={false}
        overviewId="overview"
        onToggleOverview={jest.fn()}
        onOpenGuide={onOpenGuide}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Guía' }));

    expect(onOpenGuide).toHaveBeenCalledTimes(1);
  });
});
