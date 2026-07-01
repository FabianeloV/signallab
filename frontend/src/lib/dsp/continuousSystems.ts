import type { ContinuousSignal, FilterType } from '../../types/signal';

/**
 * Generadores de respuestas al impulso h(t) de los sistemas LTI en tiempo
 * continuo, aproximadas sobre la misma rejilla temporal densa que las
 * señales de entrada (mismo catálogo conceptual que `systems.ts`).
 *
 * `order` y `delay` se reinterpretan aquí como segundos (duración de la
 * ventana / retardo), en vez de número de muestras.
 *
 * Los deltas de Dirac se codifican como una muestra de altura `1/dt` (o
 * `peso/dt`) para que `convolveContinuous` los reproduzca exactamente al
 * escalar por `dt`; su posición/peso real se expone en `impulses` para que
 * el plot los dibuje como flechas en vez de esa muestra desproporcionada.
 */

function toSamples(durationSeconds: number, dt: number): number {
  return Math.max(1, Math.round(durationSeconds / dt));
}

function toShift(delay: number, dt: number): number {
  return Math.max(0, Math.round(delay / dt));
}

/** Promediador móvil continuo: h(t) = 1/T para 0 ≤ t ≤ T. Filtro pasa-bajo elemental. */
export function continuousMovingAverage(
  order: number,
  dt: number,
  delay = 0,
): ContinuousSignal {
  const T = Math.max(order, dt);
  const length = toSamples(T, dt) + 1;
  const value = 1 / T;
  return { t0: toShift(delay, dt) * dt, dt, samples: new Array(length).fill(value) };
}

/** Promediador ponderado continuo: ventana triangular normalizada de duración T = order. */
export function continuousWeightedAverage(
  order: number,
  dt: number,
  delay = 0,
): ContinuousSignal {
  const T = Math.max(order, dt);
  const length = Math.max(2, toSamples(T, dt)) + 1;
  const half = (length - 1) / 2;
  const raw = Array.from({ length }, (_, i) => 1 - Math.abs(i - half) / (half + 1));
  const area = raw.reduce((a, b) => a + b, 0) * dt || dt;
  const samples = raw.map((w) => w / area);
  return { t0: toShift(delay, dt) * dt, dt, samples };
}

/**
 * Pasa-altos continuo por inversión espectral: h(t) = δ(t) − (1/T)·rect(t)
 * para 0 ≤ t ≤ T. Ganancia nula en continua (elimina el nivel medio).
 */
export function continuousHighPass(
  order: number,
  dt: number,
  delay = 0,
): ContinuousSignal {
  const T = Math.max(order, dt);
  const length = toSamples(T, dt) + 1;
  const avg = 1 / T;
  const samples = Array.from({ length }, (_, i) => (i === 0 ? 1 / dt - avg : -avg));
  const t0 = toShift(delay, dt) * dt;
  return { t0, dt, samples, impulses: [{ t: t0, weight: 1 }] };
}

/**
 * Diferenciador continuo: h(t) ≈ [δ(t) − δ(t−dt)] / dt (doblete), que tras
 * escalar por dt en la convolución reproduce la diferencia finita
 * (x(t)−x(t−dt))/dt, una aproximación numérica de d/dt. Se exponen dos
 * "impulsos" de peso ±1 solo para representar el doblete visualmente.
 */
export function continuousDifferentiator(dt: number): ContinuousSignal {
  return {
    t0: 0,
    dt,
    samples: [1 / (dt * dt), -1 / (dt * dt)],
    impulses: [
      { t: 0, weight: 1 },
      { t: dt, weight: -1 },
    ],
  };
}

/** Sistema de primer orden (tipo RC): h(t) = a·e^{-at}·u(t), con a fijo. */
export function continuousIirFirstOrder(
  a: number,
  tailSeconds: number,
  dt: number,
  delay = 0,
): ContinuousSignal {
  const length = toSamples(tailSeconds, dt);
  const samples = Array.from({ length }, (_, i) => a * Math.exp(-a * i * dt));
  return { t0: toShift(delay, dt) * dt, dt, samples };
}

/** Eco continuo: h(t) = δ(t) + 0.6·δ(t − D), con D = retardo (segundos). */
export function continuousEcho(delay: number, dt: number): ContinuousSignal {
  const D = toShift(delay, dt);
  if (D === 0) {
    return { t0: 0, dt, samples: [1.6 / dt], impulses: [{ t: 0, weight: 1.6 }] };
  }
  const samples = new Array(D + 1).fill(0);
  samples[0] = 1 / dt;
  samples[D] = 0.6 / dt;
  return {
    t0: 0,
    dt,
    samples,
    impulses: [
      { t: 0, weight: 1 },
      { t: D * dt, weight: 0.6 },
    ],
  };
}

/** Sistema paso-todo continuo (retraso puro): h(t) = δ(t − t_d). */
export function continuousAllPass(delay: number, dt: number): ContinuousSignal {
  const D = toShift(delay, dt);
  const samples = new Array(D + 1).fill(0);
  samples[D] = 1 / dt;
  return { t0: 0, dt, samples, impulses: [{ t: D * dt, weight: 1 }] };
}

/**
 * Fábrica de sistemas LTI continuos. `order` es la duración de la ventana T
 * (segundos) y `delay` el retardo (segundos), reutilizando los mismos
 * controles de la interfaz que en tiempo discreto.
 */
export function makeContinuousSystem(
  type: FilterType,
  order: number,
  delay: number,
  dt: number,
): ContinuousSignal {
  switch (type) {
    case 'promediador-fir':
      return continuousMovingAverage(order, dt, delay);
    case 'promediador-ponderado':
      return continuousWeightedAverage(order, dt, delay);
    case 'pasa-altos-fir':
      return continuousHighPass(order, dt, delay);
    case 'diferenciador':
      return continuousDifferentiator(dt);
    case 'iir-primer-orden':
      return continuousIirFirstOrder(0.7, Math.max(order + 1, 8), dt, delay);
    case 'eco':
      return continuousEcho(delay, dt);
    case 'paso-todo':
      return continuousAllPass(delay, dt);
    default:
      return continuousMovingAverage(order, dt, delay);
  }
}
