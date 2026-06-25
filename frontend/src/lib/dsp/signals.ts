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

/** Coseno discreto x[n] = cos(2π f n). */
export function cosine(frequency: number, N: number): DiscreteSignal {
  const samples = Array.from({ length: N }, (_, n) =>
    Math.cos(2 * Math.PI * frequency * n),
  );
  return { n0: 0, samples };
}

/** Senoide amortiguada x[n] = a^n · sin(2π f n) · u[n], con a fijo de decaimiento. */
export function dampedSinusoid(
  frequency: number,
  N: number,
  decay = 0.85,
): DiscreteSignal {
  const samples = Array.from(
    { length: N },
    (_, n) => Math.pow(decay, n) * Math.sin(2 * Math.PI * frequency * n),
  );
  return { n0: 0, samples };
}

/** Pulso rectangular x[n] = u[n] − u[n−W] (1 para 0 ≤ n < W). */
export function rectPulse(width: number, N: number): DiscreteSignal {
  const w = Math.max(1, Math.min(Math.round(width), N));
  const samples = Array.from({ length: N }, (_, n) => (n < w ? 1 : 0));
  return { n0: 0, samples };
}

/** Pulso triangular de ancho W, con pico unitario en su centro. */
export function triangularPulse(width: number, N: number): DiscreteSignal {
  const w = Math.max(2, Math.min(Math.round(width), N));
  const half = w / 2;
  const samples = Array.from({ length: N }, (_, n) =>
    n <= w ? Math.max(0, 1 - Math.abs(n - half) / half) : 0,
  );
  return { n0: 0, samples };
}

/** Onda cuadrada discreta x[n] = sgn(sin(2π f n)). */
export function squareWave(frequency: number, N: number): DiscreteSignal {
  const samples = Array.from(
    { length: N },
    (_, n) => Math.sign(Math.sin(2 * Math.PI * frequency * n)) || 1,
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
    case 'exponencial-creciente':
      // Misma forma a^n con a > 1 (crece sin cota: sistema/entrada inestable).
      return exponential(param, N);
    case 'escalon':
      return step(N);
    case 'impulso':
      return impulse(N);
    case 'senoide':
      return sinusoid(param, N);
    case 'coseno':
      return cosine(param, N);
    case 'senoide-amortiguada':
      return dampedSinusoid(param, N);
    case 'rampa':
      return ramp(N);
    case 'pulso-rectangular':
      return rectPulse(param, N);
    case 'triangular':
      return triangularPulse(param, N);
    case 'cuadrada':
      return squareWave(param, N);
    default:
      return exponential(0.75, N);
  }
}
