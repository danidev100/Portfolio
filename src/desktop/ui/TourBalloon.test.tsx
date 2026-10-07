import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';

import { TOUR_STEPS } from '../util/tourSteps';
import { TourBalloon } from './TourBalloon';

type TourBalloonProps = ComponentProps<typeof TourBalloon>;

function renderBalloon(
  stepIndex: number,
  overrides: Partial<TourBalloonProps> = {},
): TourBalloonProps {
  const step = TOUR_STEPS[stepIndex];
  if (!step) throw new Error(`There is no step ${String(stepIndex)}`);

  const props: TourBalloonProps = {
    step,
    stepNumber: stepIndex + 1,
    stepCount: TOUR_STEPS.length,
    position: { left: 100, bottom: 120, arrowLeft: 160 },
    width: 320,
    finalAction: { label: 'Ver mi perfil y CV', href: '/about', onClick: jest.fn() },
    onNext: jest.fn(),
    onPrevious: jest.fn(),
    onClose: jest.fn(),
    ...overrides,
  };
  render(<TourBalloon {...props} />);

  return props;
}

describe('TourBalloon', () => {
  it('is a non-modal dialog named after its step', () => {
    renderBalloon(0);

    const balloon = screen.getByRole('dialog', { name: 'Empieza por aquí' });

    expect(balloon).toHaveAttribute('aria-modal', 'false');
    expect(balloon).toHaveAccessibleDescription(
      'Empieza aquí: mi perfil, experiencia y CV para descargar.',
    );
  });

  it('says where the visitor is in the tour', () => {
    renderBalloon(1);

    expect(screen.getByText('Paso 2 de 3')).toBeInTheDocument();
  });

  it('takes the focus when it shows a step', () => {
    renderBalloon(0);

    expect(screen.getByRole('dialog', { name: 'Empieza por aquí' })).toHaveFocus();
  });

  it('moves forward and lets the visitor skip from the first step', async () => {
    const user = userEvent.setup();
    const { onNext, onClose } = renderBalloon(0);

    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    await user.click(screen.getByRole('button', { name: 'Saltar guía' }));

    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: 'Anterior' })).not.toBeInTheDocument();
  });

  it('goes back from a later step', async () => {
    const user = userEvent.setup();
    const { onPrevious } = renderBalloon(1);

    await user.click(screen.getByRole('button', { name: 'Anterior' }));

    expect(onPrevious).toHaveBeenCalledTimes(1);
  });

  it('ends on the last step with a way to the profile and a way out', async () => {
    const user = userEvent.setup();
    const { finalAction, onClose } = renderBalloon(2);

    expect(screen.queryByRole('button', { name: 'Siguiente' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver mi perfil y CV' })).toHaveAttribute(
      'href',
      '/about',
    );

    await user.click(screen.getByRole('link', { name: 'Ver mi perfil y CV' }));
    await user.click(screen.getByRole('button', { name: 'Terminar' }));

    expect(finalAction.onClick).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes with Escape', async () => {
    const user = userEvent.setup();
    const { onClose } = renderBalloon(0);

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('sits where its position says, with the given width', () => {
    renderBalloon(0);

    expect(screen.getByRole('dialog', { name: 'Empieza por aquí' })).toHaveStyle({
      left: '100px',
      bottom: '120px',
      width: '320px',
    });
  });
});
