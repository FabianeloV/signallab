import type { DiscreteSignal } from '../../types/signal';

/**
 * Convolución lineal discreta:
 *
 *      y[n] = (x * h)[n] = Σ_k x[k] · h[n - k]
 *
 * Si x tiene soporte [x.n0, x.n0 + Lx - 1] y h soporte [h.n0, h.n0 + Lh - 1],
 * el resultado tiene soporte [x.n0 + h.n0, x.n0 + h.n0 + Lx + Lh - 2] y
 * longitud Lx + Lh - 1. Se preserva la contabilidad del índice inicial.
 */
export function convolve(x: DiscreteSignal, h: DiscreteSignal): DiscreteSignal {
  const Lx = x.samples.length;
  const Lh = h.samples.length;
  if (Lx === 0 || Lh === 0) return { n0: x.n0 + h.n0, samples: [] };

  const Ly = Lx + Lh - 1;
  const samples = new Array(Ly).fill(0);
  for (let i = 0; i < Lx; i++) {
    const xi = x.samples[i];
    if (xi === 0) continue;
    for (let j = 0; j < Lh; j++) {
      samples[i + j] += xi * h.samples[j];
    }
  }
  return { n0: x.n0 + h.n0, samples };
}

/**
 * Convolución circular de longitud N (rellena con ceros las señales hasta N).
 * Útil para ilustrar la diferencia con la convolución lineal.
 */
export function circularConvolve(
  x: number[],
  h: number[],
  N?: number,
): number[] {
  const len = N ?? Math.max(x.length, h.length);
  const xp = padTo(x, len);
  const hp = padTo(h, len);
  const y = new Array(len).fill(0);
  for (let n = 0; n < len; n++) {
    let acc = 0;
    for (let k = 0; k < len; k++) {
      acc += xp[k] * hp[(n - k + len) % len];
    }
    y[n] = acc;
  }
  return y;
}

function padTo(arr: number[], len: number): number[] {
  const out = arr.slice(0, len);
  while (out.length < len) out.push(0);
  return out;
}
