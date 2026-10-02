import { toTokens } from './tokens';

describe('toTokens', () => {
  it('splits a text into words that keep their trailing space', () => {
    expect(toTokens('Sí. Lideré un equipo.')).toEqual(['Sí. ', 'Lideré ', 'un ', 'equipo.']);
  });

  it('loses nothing: joining the tokens gives the text back', () => {
    const text = '  Dos  espacios,\nun salto y un final. ';

    expect(toTokens(text).join('')).toBe(text);
  });

  it('has no tokens for an empty text', () => {
    expect(toTokens('')).toEqual([]);
  });
});
