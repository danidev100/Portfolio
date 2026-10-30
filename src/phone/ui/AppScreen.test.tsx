import { render, screen, within } from '@testing-library/react';

import type { PhoneFlavor } from '@/shared/util/deviceProfile';

import { AppScreen } from './AppScreen';

function renderApp(flavor: PhoneFlavor): void {
  render(
    <AppScreen flavor={flavor} title="Proyectos" onHome={jest.fn()}>
      Contenido de proyectos
    </AppScreen>,
  );
}

describe('AppScreen', () => {
  it('puts the android title in the top app bar beside an arrow home', () => {
    renderApp('android');
    const bar = screen.getByRole('banner');

    expect(within(bar).getByRole('heading', { level: 1, name: 'Proyectos' })).toBeInTheDocument();
    expect(within(bar).getByRole('link', { name: 'Inicio' })).toHaveTextContent(/^$/);
  });

  it('keeps the ios large title under «‹ Inicio»', () => {
    renderApp('ios');
    const bar = screen.getByRole('banner');

    expect(within(bar).getByRole('link', { name: 'Inicio' })).toHaveTextContent('Inicio');
    expect(within(bar).getByRole('heading', { level: 1, name: 'Proyectos' })).toBeInTheDocument();
  });

  it('scrolls its content in the main landmark', () => {
    renderApp('ios');

    expect(screen.getByRole('main')).toHaveTextContent('Contenido de proyectos');
  });
});
