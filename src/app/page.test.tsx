import { render, screen } from '@testing-library/react';

import HomePage from './page';

describe('HomePage', () => {
  it('shows the Dani OS heading', () => {
    render(<HomePage />);

    expect(screen.getByRole('heading', { level: 1, name: 'Dani OS' })).toBeInTheDocument();
  });
});
