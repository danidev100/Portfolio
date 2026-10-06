import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DesktopGreeting } from './DesktopGreeting';

describe('DesktopGreeting', () => {
  it('introduces Daniel with his role', () => {
    render(<DesktopGreeting currentHref="/" onOpen={jest.fn()} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Daniel Jaramillo' })).toBeInTheDocument();
    expect(screen.getByText('Frontend Tech Lead · AI App Developer')).toBeInTheDocument();
  });

  it('explains the desktop metaphor without jargon', () => {
    render(<DesktopGreeting currentHref="/" onOpen={jest.fn()} />);

    expect(
      screen.getByText(
        'Este portafolio funciona como un escritorio: cada sección se abre en su propia ventana.',
      ),
    ).toBeInTheDocument();
  });

  it('links to the profile first, then to the projects and the AI', () => {
    render(<DesktopGreeting currentHref="/" onOpen={jest.fn()} />);

    const links = screen.getAllByRole('link');

    expect(links.map((link) => link.textContent)).toEqual([
      'Ver mi perfil y CV',
      'Ver proyectos',
      'Pregúntale a mi IA',
    ]);
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/about',
      '/projects',
      '/terminal',
    ]);
  });

  it('opens the app of the link that was clicked', async () => {
    const user = userEvent.setup();
    const onOpen = jest.fn();
    render(<DesktopGreeting currentHref="/" onOpen={onOpen} />);

    await user.click(screen.getByRole('link', { name: 'Ver mi perfil y CV' }));

    expect(onOpen).toHaveBeenCalledWith('about');
  });
});
