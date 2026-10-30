import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { APPS } from '@/shared/util/apps';

import { GuideSheet } from './GuideSheet';

function renderGuide(): { onClose: jest.Mock; onOpenApp: jest.Mock } {
  const onClose = jest.fn();
  const onOpenApp = jest.fn();
  render(<GuideSheet isOpen currentHref="/" onClose={onClose} onOpenApp={onOpenApp} />);

  return { onClose, onOpenApp };
}

describe('GuideSheet', () => {
  it('presents every app', () => {
    renderGuide();

    const guide = screen.getByRole('dialog', { name: 'Guía' });

    expect(guide).toHaveTextContent('Un recorrido corto por Dani OS.');
    for (const app of Object.values(APPS)) {
      expect(screen.getByRole('link', { name: new RegExp(app.title) })).toHaveAttribute(
        'href',
        app.href,
      );
    }
    expect(guide).toHaveTextContent('Pregunta lo que quieras sobre mi experiencia.');
  });

  it('opens the chosen app and closes', async () => {
    const user = userEvent.setup();
    const { onClose, onOpenApp } = renderGuide();

    await user.click(screen.getByRole('link', { name: /Contacto/ }));

    expect(onOpenApp).toHaveBeenCalledWith('contact');
    expect(onClose).toHaveBeenCalled();
  });

  it('closes from its button', async () => {
    const user = userEvent.setup();
    const { onClose } = renderGuide();

    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    expect(onClose).toHaveBeenCalled();
  });
});
