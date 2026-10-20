import { z } from 'zod';

import type { AskEvent } from '@/shared/types/ask';

/** Checks what arrives over the network before it reaches the store. */
export const askEventSchema: z.ZodType<AskEvent> = z.discriminatedUnion('type', [
  z.object({ type: z.literal('focus_nodes'), nodeIds: z.array(z.string()) }),
  z.object({ type: z.literal('token'), text: z.string() }),
  z.object({ type: z.literal('done') }),
  z.object({ type: z.literal('error'), message: z.string() }),
]);
