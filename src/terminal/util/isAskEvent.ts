import type { AskEvent } from '@/shared/types/ask';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/**
 * Checks what arrives over the network before it reaches the store. Written
 * by hand: a schema library would load on every page, since the store does.
 */
export function isAskEvent(value: unknown): value is AskEvent {
  if (!isRecord(value)) return false;

  switch (value.type) {
    case 'focus_nodes':
      return (
        Array.isArray(value.nodeIds) && value.nodeIds.every((nodeId) => typeof nodeId === 'string')
      );
    case 'token':
      return typeof value.text === 'string';
    case 'done':
      return true;
    case 'error':
      return typeof value.message === 'string';
    default:
      return false;
  }
}
