import { render, screen } from '@testing-library/react';

import { StandalonePage } from './StandalonePage';

describe('StandalonePage', () => {
  it('shows the app title as the page heading with its content', () => {
    render(
      <StandalonePage title="Proyectos">
        <p>Contenido de la app</p>
      </StandalonePage>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Proyectos' })).toBeInTheDocument();
    expect(screen.getByText('Contenido de la app')).toBeInTheDocument();
  });

  it('links back to the desktop', () => {
    render(
      <StandalonePage title="Proyectos">
        <p>Contenido de la app</p>
      </StandalonePage>,
    );

    expect(screen.getByRole('link', { name: 'Ir al escritorio' })).toHaveAttribute('href', '/');
  });
});
