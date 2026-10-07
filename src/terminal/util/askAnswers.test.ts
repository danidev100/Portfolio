import {
  describeNode,
  findRelatedNodeIds,
  resolveAnswer,
  SUGGESTED_QUESTIONS,
  WELCOME_MESSAGE,
} from './askAnswers';
import { GRAPH_NODES } from './graph';

describe('findRelatedNodeIds', () => {
  it('finds the nodes tagged with a word of the question', () => {
    expect(findRelatedNodeIds('¿Qué sabes de AWS?', GRAPH_NODES)).toEqual(['aws']);
  });

  it('ignores accents and letter case', () => {
    expect(findRelatedNodeIds('experiencia en MÓVIL', GRAPH_NODES)).toEqual(['hp', 'rn', 'k90']);
  });

  it('matches short technical terms such as IA', () => {
    expect(findRelatedNodeIds('proyectos de ia', GRAPH_NODES)).toEqual(
      expect.arrayContaining(['arus', 'mcp', 'sdk', 'k50', 'ask']),
    );
  });

  it('matches plurals and other longer forms of a tag', () => {
    expect(findRelatedNodeIds('¿has trabajado con equipos?', GRAPH_NODES)).toEqual(['hp', 'k7']);
  });

  it('does not match on filler words', () => {
    expect(findRelatedNodeIds('¿qué has hecho con los del año?', GRAPH_NODES)).toEqual([]);
  });

  it('does not match a word that is only the beginning of a tag', () => {
    expect(findRelatedNodeIds('nat', GRAPH_NODES)).toEqual([]);
  });
});

describe('resolveAnswer', () => {
  it('gives the scripted answer of a suggested question', () => {
    const answer = resolveAnswer('¿Has liderado equipos?');

    expect(answer.nodeIds).toEqual(['hp', 'k7', 'ds', 'k60', 'ci']);
    expect(answer.text).toContain('equipo frontend de 7 desarrolladores');
  });

  it('recognizes a suggested question typed with other spacing and case', () => {
    expect(resolveAnswer('  ¿has liderado equipos? ').nodeIds).toEqual([
      'hp',
      'k7',
      'ds',
      'k60',
      'ci',
    ]);
  });

  it('has an answer for every suggested question', () => {
    const answers = SUGGESTED_QUESTIONS.map((question) => resolveAnswer(question));

    expect(SUGGESTED_QUESTIONS.length).toBeGreaterThan(0);
    expect(answers.every((answer) => answer.nodeIds.length > 0)).toBe(true);
  });

  it('lists the related nodes for a question it has no script for', () => {
    const answer = resolveAnswer('¿Qué sabes de AWS?');

    expect(answer.nodeIds).toEqual(['aws']);
    expect(answer.text).toContain('AWS Lambda · S3');
  });

  it('says so, and suggests topics, when nothing is related', () => {
    const answer = resolveAnswer('¿Cuál es tu color favorito?');

    expect(answer.nodeIds).toEqual([]);
    expect(answer.text).toContain('No encontré');
  });
});

describe('describeNode', () => {
  it('focuses the node together with the ones it connects to', () => {
    const answer = describeNode('ds');

    expect(answer.nodeIds).toEqual(['ds', 'hp', 'k60', 'a11y']);
    expect(answer.text).toBe(
      'Design System se conecta con: Home Power · Tech Lead, 60% adopción del DS, Accesibilidad.',
    );
    expect(answer.question).toBe('¿Con qué se conecta Design System?');
  });

  it('has nothing to say about a node that does not exist', () => {
    expect(describeNode('missing')).toEqual({ nodeIds: [], text: '', question: '' });
  });
});

describe('WELCOME_MESSAGE', () => {
  it('introduces the ai in the voice agreed in the spec', () => {
    expect(WELCOME_MESSAGE).toBe(
      'Hola, soy la IA de Daniel. Pregúntame por mi experiencia, mis proyectos o cómo trabajo.',
    );
  });
});
