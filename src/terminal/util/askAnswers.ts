import { getConnectedNodeIds, GRAPH_EDGES, GRAPH_NODES, type GraphNode } from './graph';

export interface Answer {
  /** Nodes the answer is about; empty when it is about none in particular. */
  nodeIds: string[];
  text: string;
}

interface ScriptedAnswer extends Answer {
  question: string;
}

const SCRIPTED_ANSWERS: readonly ScriptedAnswer[] = [
  {
    question: '¿Has liderado equipos?',
    nodeIds: ['hp', 'k7', 'ds', 'k60', 'ci'],
    text: 'Sí. En Home Power Colombia lideré un equipo frontend de 7 desarrolladores como Tech Lead: definí estándares de arquitectura Angular, construí un design system con 60% de adopción en producción y automaticé quality gates con SonarQube y Husky.',
  },
  {
    question: '¿Qué haces con IA?',
    nodeIds: ['mcp', 'sdk', 'arus', 'k50', 'ask'],
    text: 'Introduje flujos AI-native en mi equipo con Claude CLI y MCP para acotar MVPs. Antes, en ARUS, llevé el 50% de los algoritmos de IA de la organización a interfaces web. Hoy profundizo en AI SDKs con streaming y tool-calling.',
  },
  {
    question: '¿Sabes de microfrontends?',
    nodeIds: ['mfe', 'ng', 'rx', 'hp'],
    text: 'Sí. He entregado arquitecturas de microfrontends en producción con Nx y Native Federation sobre Angular, usando Signals y RxJS para el estado compartido.',
  },
];

export const SUGGESTED_QUESTIONS: readonly string[] = SCRIPTED_ANSWERS.map(
  (scripted) => scripted.question,
);

export const WELCOME_MESSAGE =
  'Hola, soy la IA de Daniel. Pregúntame por mi experiencia, mis proyectos o cómo trabajo.';

/** A node picked by hand, told as the question the visitor would have asked. */
export interface NodeDescription extends Answer {
  question: string;
}

const NOTHING_RELATED =
  'No encontré nada relacionado con esa pregunta. Prueba con: equipo, IA, Angular, móvil o AWS.';

/** Words too common to say anything about what a question is asking for. */
const FILLER_WORDS = new Set(
  'al como con cual de del el en es ha has he la las lo los me mi por que se su sus te tu tus un una y'.split(
    ' ',
  ),
);

/** From this length on, a word also matches longer forms of itself (plurals…). */
const MIN_STEM_LENGTH = 4;

const DIACRITICS = /[̀-ͯ]/g;
const NOT_ALPHANUMERIC = /[^a-z0-9]+/;

function toWords(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(DIACRITICS, '')
    .split(NOT_ALPHANUMERIC)
    .filter(Boolean);
}

function isSameTerm(word: string, term: string): boolean {
  if (word === term) return true;
  if (word.length < MIN_STEM_LENGTH || term.length < MIN_STEM_LENGTH) return false;

  return word.startsWith(term) || term.startsWith(word);
}

/** Ids of the nodes whose tags or label share a meaningful word with the question. */
export function findRelatedNodeIds(question: string, nodes: readonly GraphNode[]): string[] {
  const words = toWords(question).filter((word) => !FILLER_WORDS.has(word));

  return nodes
    .filter((node) => {
      const terms = [...node.tags, ...toWords(node.label)];

      return words.some((word) => terms.some((term) => isSameTerm(word, term)));
    })
    .map((node) => node.id);
}

function getLabels(nodeIds: readonly string[]): string[] {
  return nodeIds.flatMap((nodeId) => {
    const node = GRAPH_NODES.find((candidate) => candidate.id === nodeId);

    return node ? [node.label] : [];
  });
}

/** What the simulated assistant answers. V2 replaces this with a real model. */
export function resolveAnswer(question: string): Answer {
  const normalizedQuestion = toWords(question).join(' ');
  const scripted = SCRIPTED_ANSWERS.find(
    (candidate) => toWords(candidate.question).join(' ') === normalizedQuestion,
  );
  if (scripted) return { nodeIds: scripted.nodeIds, text: scripted.text };

  const nodeIds = findRelatedNodeIds(question, GRAPH_NODES);
  if (nodeIds.length === 0) return { nodeIds, text: NOTHING_RELATED };

  return {
    nodeIds,
    text: `Encontré relación con: ${getLabels(nodeIds).join(', ')}. Esta respuesta es simulada: la versión con IA real contestará con detalle a partir de mi CV.`,
  };
}

/** What the graph shows and says when a node is picked by hand. */
export function describeNode(nodeId: string): NodeDescription {
  const [label] = getLabels([nodeId]);
  if (label === undefined) return { nodeIds: [], text: '', question: '' };

  const connectedIds = getConnectedNodeIds(nodeId, GRAPH_EDGES);

  return {
    nodeIds: [nodeId, ...connectedIds],
    text: `${label} se conecta con: ${getLabels(connectedIds).join(', ')}.`,
    question: `¿Con qué se conecta ${label}?`,
  };
}
