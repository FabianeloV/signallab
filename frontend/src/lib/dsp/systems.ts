import type { DiscreteSignal, FilterType } from '../../types/signal';

/**
 * Generadores de respuestas al impulso h[n] de los sistemas LTI.
 *
 * El parámetro `delay` (n_d en la interfaz) desplaza la respuesta hacia la
 * derecha, lo que se modela ajustando el índice inicial `n0`.
 */

/**
 * Promediador móvil (FIR) de orden M: h[n] = 1/(M+1) para 0 ≤ n ≤ M.
 * Es un filtro pasa-bajo elemental.
 */
export function movingAverage(order: number, delay = 0): DiscreteSignal {
  const length = order + 1;
  const value = 1 / length;
  return { n0: delay, samples: new Array(length).fill(value) };
}

/**
 * Promediador ponderado (FIR triangular / ventana de Bartlett) de orden M:
 * pesos triangulares con pico al centro, normalizados para sumar 1. Suaviza
 * más que el promediador rectangular (mejor atenuación fuera de banda).
 */
export function weightedAverage(order: number, delay = 0): DiscreteSignal {
  const length = order + 1;
  const half = (length - 1) / 2;
  const raw = Array.from({ length }, (_, n) => 1 - Math.abs(n - half) / (half + 1));
  const sum = raw.reduce((a, b) => a + b, 0) || 1;
  return { n0: delay, samples: raw.map((w) => w / sum) };
}

/**
 * Pasa-altos FIR por inversión espectral: h[n] = δ[n] − 1/(M+1) para 0 ≤ n ≤ M.
 * Su ganancia en continua (DC) es cero, por lo que elimina el nivel medio.
 */
export function highPass(order: number, delay = 0): DiscreteSignal {
  const length = order + 1;
  const avg = 1 / length;
  const samples = Array.from({ length }, (_, n) => (n === 0 ? 1 - avg : -avg));
  return { n0: delay, samples };
}

/** Diferenciador de primer orden: h[n] = δ[n] - δ[n-1]. */
export function differentiator(delay = 0): DiscreteSignal {
  return { n0: delay, samples: [1, -1] };
}

/** Eco simple: h[n] = δ[n] + 0.6·δ[n − D], con D = retraso. */
export function echo(delay: number): DiscreteSignal {
  const D = Math.max(0, Math.round(delay));
  if (D === 0) return { n0: 0, samples: [1.6] };
  const samples = new Array(D + 1).fill(0);
  samples[0] = 1;
  samples[D] = 0.6;
  return { n0: 0, samples };
}

/**
 * Respuesta al impulso de un IIR de primer orden y[n] = a·y[n-1] + x[n],
 * cuya respuesta al impulso es h[n] = a^n · u[n] (truncada para graficar).
 * `order` se reutiliza aquí como longitud visible de la cola.
 */
export function iirFirstOrder(a: number, length: number, delay = 0): DiscreteSignal {
  const samples = Array.from({ length: Math.max(length, 1) }, (_, n) =>
    Math.pow(a, n),
  );
  return { n0: delay, samples };
}

/** Sistema paso-todo trivial (identidad con retraso): h[n] = δ[n - n_d]. */
export function allPass(delay = 0): DiscreteSignal {
  return { n0: delay, samples: [1] };
}

/**
 * Fábrica de sistemas LTI. `order` es el orden del filtro (M) y `delay` el
 * desplazamiento. Para el IIR se usa `order` como longitud de la cola y un
 * coeficiente fijo de realimentación.
 */
export function makeSystem(
  type: FilterType,
  order: number,
  delay: number,
): DiscreteSignal {
  switch (type) {
    case 'promediador-fir':
      return movingAverage(order, delay);
    case 'promediador-ponderado':
      return weightedAverage(order, delay);
    case 'pasa-altos-fir':
      return highPass(order, delay);
    case 'diferenciador':
      return differentiator(delay);
    case 'iir-primer-orden':
      return iirFirstOrder(0.7, Math.max(order + 1, 8), delay);
    case 'eco':
      return echo(delay);
    case 'paso-todo':
      return allPass(delay);
    default:
      return movingAverage(order, delay);
  }
}
