import type { ReactNode } from 'react';

export default function HomePage(): ReactNode {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="font-mono text-xs tracking-widest text-muted uppercase">Daniel Jaramillo</p>
      <h1 className="font-display text-5xl font-bold">Dani OS</h1>
      <p className="text-muted">Frontend Tech Lead · AI App Developer</p>
    </main>
  );
}
