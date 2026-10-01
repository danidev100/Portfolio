export function isWebGLAvailable(): boolean {
  const canvas = document.createElement('canvas');

  return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
}
