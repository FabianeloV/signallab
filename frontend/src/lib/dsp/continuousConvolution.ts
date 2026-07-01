import { convolve } from './convolution';
import type { ContinuousSignal } from '../../types/signal';

/**
 * Convolución continua aproximada por integración de Riemann:
 *
 *      y(t) = (x * h)(t) = ∫ x(τ)·h(t−τ) dτ  ≈  dt · Σ x[k]·h[n−k]
 *
 * Reutiliza literalmente la suma de convolución discreta (`convolve`) sobre
 * los índices enteros de la rejilla temporal compartida (mismo `dt` en x y
 * h) y reescala el resultado por `dt` para aproximar la integral.
 */
export function convolveContinuous(
  x: ContinuousSignal,
  h: ContinuousSignal,
): ContinuousSignal {
  const dt = x.dt;
  const nx0 = Math.round(x.t0 / dt);
  const nh0 = Math.round(h.t0 / dt);

  const disc = convolve({ n0: nx0, samples: x.samples }, { n0: nh0, samples: h.samples });

  return {
    t0: disc.n0 * dt,
    dt,
    samples: disc.samples.map((v) => v * dt),
  };
}
