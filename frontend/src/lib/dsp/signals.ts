import type { DiscreteSignal, InputSignalType } from '../../types/signal';

/**
 * Generadores de señales de entrada x[n] del laboratorio LTI.
 *
 * Todas las señales generadas tienen soporte causal (comienzan en n = 0),
 * por lo que `n0 = 0`.
 */

/** Exponencial decreciente x[n] = a^n · u[n], con 0 < a < 1 para decaimiento. */
export function exponential(a: number, N: number): DiscreteSignal {
  const samples = Array.from({ length: N }, (_, n) => Math.pow(a, n));
  return { n0: 0, samples };
}

/** Escalón unitario x[n] = u[n]. */
export function step(N: number): DiscreteSignal {
  return { n0: 0, samples: new Array(N).fill(1) };
}

/** Impulso unitario x[n] = δ[n]. */
export function impulse(N: number): DiscreteSignal {
  const samples = new Array(N).fill(0);
  samples[0] = 1;
  return { n0: 0, samples };
}

/** Senoide discreta x[n] = sin(2π f n), f en ciclos/muestra. */
export function sinusoid(frequency: number, N: number): DiscreteSignal {
  const samples = Array.from({ length: N }, (_, n) =>
    Math.sin(2 * Math.PI * frequency * n),
  );
  return { n0: 0, samples };
}

/** Rampa x[n] = n · u[n], normalizada para no crecer sin control. */
export function ramp(N: number): DiscreteSignal {
  const samples = Array.from({ length: N }, (_, n) => n / Math.max(N - 1, 1));
  return { n0: 0, samples };
}

/**
 * Fábrica que produce x[n] según el tipo seleccionado en la interfaz.
 * `param` reutiliza el deslizador secundario (factor de decaimiento para la
 * exponencial, frecuencia para la senoide).
 */
export function makeInputSignal(
  type: InputSignalType,
  N: number,
  param: number,
): DiscreteSignal {
  switch (type) {
    case 'exponencial-decreciente':
      return exponential(param, N);
    case 'escalon':
      return step(N);
    case 'impulso':
      return impulse(N);
    case 'senoide':
      return sinusoid(param, N);
    case 'rampa':
      return ramp(N);
    default:
      return exponential(0.75, N);
  }
}
