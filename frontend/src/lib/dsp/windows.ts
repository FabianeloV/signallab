import type { WindowType } from '../../types/signal';

/**
 * Funciones de ventana (windowing) para reducir las fugas espectrales
 * (spectral leakage) al analizar segmentos finitos de señal.
 *
 * Todas devuelven un arreglo de longitud `N` con coeficientes en [0, 1].
 */

export function rectangular(N: number): number[] {
  return new Array(N).fill(1);
}

export function hamming(N: number): number[] {
  if (N <= 1) return [1];
  return Array.from(
    { length: N },
    (_, n) => 0.54 - 0.46 * Math.cos((2 * Math.PI * n) / (N - 1)),
  );
}

export function hanning(N: number): number[] {
  if (N <= 1) return [1];
  return Array.from(
    { length: N },
    (_, n) => 0.5 - 0.5 * Math.cos((2 * Math.PI * n) / (N - 1)),
  );
}

export function blackman(N: number): number[] {
  if (N <= 1) return [1];
  return Array.from({ length: N }, (_, n) => {
    const a0 = 0.42;
    const a1 = 0.5;
    const a2 = 0.08;
    return (
      a0 -
      a1 * Math.cos((2 * Math.PI * n) / (N - 1)) +
      a2 * Math.cos((4 * Math.PI * n) / (N - 1))
    );
  });
}

const WINDOW_FNS: Record<WindowType, (N: number) => number[]> = {
  rectangular,
  hamming,
  hanning,
  blackman,
};

/** Genera la ventana del tipo indicado. */
export function makeWindow(type: WindowType, N: number): number[] {
  return WINDOW_FNS[type](N);
}

/** Aplica (multiplica muestra a muestra) una ventana a una señal. */
export function applyWindow(samples: number[], type: WindowType): number[] {
  const w = makeWindow(type, samples.length);
  return samples.map((s, i) => s * w[i]);
}
