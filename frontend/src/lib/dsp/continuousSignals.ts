import type { ContinuousSignal, InputSignalType } from '../../types/signal';

/**
 * Generadores de señales de entrada x(t) en tiempo continuo, aproximadas
 * sobre una rejilla temporal densa (mismo catálogo conceptual que
 * `signals.ts`, evaluado en t real en vez de índices enteros n).
 *
 * Todas comienzan en t = 0 (causales), por lo que `t0 = 0`.
 */

/** Exponencial x(t) = a^t · u(t) (decreciente si 0<a<1, creciente si a>1). */
export function continuousExponential(a: number, dt: number, N: number): ContinuousSignal {
  const samples = Array.from({ length: N }, (_, i) => Math.pow(a, i * dt));
  return { t0: 0, dt, samples };
}

/** Escalón unitario x(t) = u(t). */
export function continuousStep(dt: number, N: number): ContinuousSignal {
  return { t0: 0, dt, samples: new Array(N).fill(1) };
}

/**
 * Impulso de Dirac aproximado: una muestra de altura 1/dt en t = 0, de forma
 * que al integrar (multiplicar por dt) reproduce un delta de peso unitario.
 * El peso real se expone en `impulses` para que el plot dibuje una flecha en
 * vez de la muestra desproporcionada.
 */
export function continuousImpulse(dt: number, N: number): ContinuousSignal {
  const samples = new Array(N).fill(0);
  samples[0] = 1 / dt;
  return { t0: 0, dt, samples, impulses: [{ t: 0, weight: 1 }] };
}

/** Senoide continua x(t) = sin(2π f t), f en Hz. */
export function continuousSinusoid(frequency: number, dt: number, N: number): ContinuousSignal {
  const samples = Array.from({ length: N }, (_, i) => Math.sin(2 * Math.PI * frequency * i * dt));
  return { t0: 0, dt, samples };
}

/** Coseno continuo x(t) = cos(2π f t). */
export function continuousCosine(frequency: number, dt: number, N: number): ContinuousSignal {
  const samples = Array.from({ length: N }, (_, i) => Math.cos(2 * Math.PI * frequency * i * dt));
  return { t0: 0, dt, samples };
}

/** Senoide amortiguada x(t) = e^{-at}·sin(2π f t)·u(t), con a fijo de decaimiento (1/s). */
export function continuousDampedSinusoid(
  frequency: number,
  dt: number,
  N: number,
  decay = 0.85,
): ContinuousSignal {
  const samples = Array.from({ length: N }, (_, i) => {
    const t = i * dt;
    return Math.exp(-decay * t) * Math.sin(2 * Math.PI * frequency * t);
  });
  return { t0: 0, dt, samples };
}

/** Pulso rectangular x(t) = u(t) − u(t−W), W en segundos. */
export function continuousRectPulse(width: number, dt: number, N: number): ContinuousSignal {
  const samples = Array.from({ length: N }, (_, i) => (i * dt < width ? 1 : 0));
  return { t0: 0, dt, samples };
}

/** Pulso triangular de ancho W (segundos), con pico unitario en su centro. */
export function continuousTriangularPulse(width: number, dt: number, N: number): ContinuousSignal {
  const half = width / 2;
  const samples = Array.from({ length: N }, (_, i) => {
    const t = i * dt;
    return t <= width ? Math.max(0, 1 - Math.abs(t - half) / half) : 0;
  });
  return { t0: 0, dt, samples };
}

/** Onda cuadrada continua x(t) = sgn(sin(2π f t)), f en Hz. */
export function continuousSquareWave(frequency: number, dt: number, N: number): ContinuousSignal {
  const samples = Array.from({ length: N }, (_, i) => {
    const t = i * dt;
    return Math.sign(Math.sin(2 * Math.PI * frequency * t)) || 1;
  });
  return { t0: 0, dt, samples };
}

/** Rampa x(t) = t·u(t), normalizada a la duración total para no crecer sin control. */
export function continuousRamp(dt: number, N: number): ContinuousSignal {
  const tMax = (N - 1) * dt || 1;
  const samples = Array.from({ length: N }, (_, i) => (i * dt) / tMax);
  return { t0: 0, dt, samples };
}

/**
 * Fábrica que produce x(t) según el tipo seleccionado en la interfaz, con la
 * misma semántica de `param` que su contraparte discreta: factor de
 * decaimiento/crecimiento para la exponencial, frecuencia (Hz) para
 * senoides/cuadrada, ancho (segundos) para pulsos.
 */
export function makeContinuousInputSignal(
  type: InputSignalType,
  dt: number,
  N: number,
  param: number,
): ContinuousSignal {
  switch (type) {
    case 'exponencial-decreciente':
    case 'exponencial-creciente':
      return continuousExponential(param, dt, N);
    case 'escalon':
      return continuousStep(dt, N);
    case 'impulso':
      return continuousImpulse(dt, N);
    case 'senoide':
      return continuousSinusoid(param, dt, N);
    case 'coseno':
      return continuousCosine(param, dt, N);
    case 'senoide-amortiguada':
      return continuousDampedSinusoid(param, dt, N);
    case 'rampa':
      return continuousRamp(dt, N);
    case 'pulso-rectangular':
      return continuousRectPulse(param, dt, N);
    case 'triangular':
      return continuousTriangularPulse(param, dt, N);
    case 'cuadrada':
      return continuousSquareWave(param, dt, N);
    default:
      return continuousExponential(0.75, dt, N);
  }
}
