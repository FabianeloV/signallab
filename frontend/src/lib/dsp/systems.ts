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

/** Diferenciador de primer orden: h[n] = δ[n] - δ[n-1]. */
export function differentiator(delay = 0): DiscreteSignal {
  return { n0: delay, samples: [1, -1] };
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
    case 'diferenciador':
      return differentiator(delay);
    case 'iir-primer-orden':
      return iirFirstOrder(0.7, Math.max(order + 1, 8), delay);
    case 'paso-todo':
      return allPass(delay);
    default:
      return movingAverage(order, delay);
  }
}
