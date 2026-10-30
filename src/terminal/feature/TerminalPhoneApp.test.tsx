import { render, screen } from '@testing-library/react';

import { TerminalPhoneApp } from './TerminalPhoneApp';

describe('TerminalPhoneApp', () => {
  it('asks without the graph', () => {
    render(<TerminalPhoneApp />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '¿Sabes de microfrontends?' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Vista general' })).not.toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Nodos del grafo' })).not.toBeInTheDocument();
  });
});
