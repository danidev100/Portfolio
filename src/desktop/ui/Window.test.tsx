import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';

import { Window } from './Window';

type WindowProps = ComponentProps<typeof Window>;

function renderWindow(overrides: Partial<WindowProps> = {}): WindowProps {
  const props: WindowProps = {
    appId: 'projects',
    title: 'Proyectos',
    isFocused: true,
    zIndex: 0,
    onFocus: jest.fn(),
    onMinimize: jest.fn(),
    onClose: jest.fn(),
    children: <p>Contenido de la ventana</p>,
    ...overrides,
  };
  render(<Window {...props} />);

  return props;
}

describe('Window', () => {
  it('renders a dialog named after its title with its content', () => {
    renderWindow();

    const dialog = screen.getByRole('dialog', { name: 'Proyectos' });

    expect(dialog).toHaveTextContent('Contenido de la ventana');
  });

  it('asks to minimize from its minimize control', async () => {
    const user = userEvent.setup();
    const { onMinimize } = renderWindow();

    await user.click(screen.getByRole('button', { name: 'Minimizar Proyectos' }));

    expect(onMinimize).toHaveBeenCalledTimes(1);
  });

  it('asks to close from its close control', async () => {
    const user = userEvent.setup();
    const { onClose } = renderWindow();

    await user.click(screen.getByRole('button', { name: 'Cerrar Proyectos' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('asks for focus when the user presses anywhere inside it', async () => {
    const user = userEvent.setup();
    const { onFocus } = renderWindow({ isFocused: false });

    await user.click(screen.getByText('Contenido de la ventana'));

    expect(onFocus).toHaveBeenCalledTimes(1);
  });

  it('does not ask for focus when the user presses a control', async () => {
    const user = userEvent.setup();
    const { onFocus } = renderWindow({ isFocused: false });

    await user.click(screen.getByRole('button', { name: 'Cerrar Proyectos' }));

    expect(onFocus).not.toHaveBeenCalled();
  });

  it('takes keyboard focus while it is the focused window', () => {
    renderWindow({ isFocused: true });

    expect(screen.getByRole('dialog', { name: 'Proyectos' })).toHaveFocus();
  });

  it('leaves keyboard focus alone while it is in the background', () => {
    renderWindow({ isFocused: false });

    expect(screen.getByRole('dialog', { name: 'Proyectos' })).not.toHaveFocus();
  });
});
