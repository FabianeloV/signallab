import type { DiscreteSignal } from '../../types/signal';

/**
 * Geometría de la convolución como "señal deslizante".
 *
 * La convolución discreta puede leerse como
 *
 *      y[n] = Σ_k h[k] · x[n − k],
 *
 * donde h[k] permanece fijo (el "impulso") y x[n − k] es la entrada
 * reflejada y desplazada n muestras (el "tren móvil"). A medida que n crece,
 * ese tren se desliza sobre h y, en cada posición, el solapamiento entre ambas
 * señales aporta una sola muestra de salida y[n] = Σ de los productos punto a
 * punto. Estas utilidades calculan, sin tocar el DOM, los datos que necesita la
 * animación para dibujar cada fotograma.
 */

/** Contribución puntual al producto h[k]·x[n−k] en una posición k del eje común. */
export interface ConvolutionTap {
  /** Índice k sobre el eje común. */
  k: number;
  /** Valor del sistema h[k] (0 fuera de su soporte). */
  h: number;
  /** Valor de la entrada reflejada y desplazada x[n−k] (0 fuera de su soporte). */
  x: number;
  /** Producto h[k]·x[n−k], es decir, la contribución de esta muestra a y[n]. */
  product: number;
  /** ¿k cae dentro del soporte de h? */
  hOn: boolean;
  /** ¿n−k cae dentro del soporte de x? (la muestra pertenece al tren móvil) */
  xOn: boolean;
}

/** Estado de la convolución para un desplazamiento n concreto. */
export interface ConvolutionFrame {
  /** Desplazamiento actual n (índice de la muestra de salida que se construye). */
  n: number;
  /** Muestras sobre todo el eje común k ∈ [kStart, kEnd]. */
  taps: ConvolutionTap[];
  /** Subconjunto de taps donde h y x se solapan (ambos dentro de su soporte). */
  overlap: ConvolutionTap[];
  /** Salida y[n] = Σ_k h[k]·x[n−k]. */
  value: number;
  /** Rango [kDesde, kHasta] del solapamiento, o null si no hay solapamiento. */
  overlapRange: [number, number] | null;
}

/** Marco fijo (independiente de n) sobre el que se anima el deslizamiento. */
export interface ConvolutionLayout {
  /** Primer índice n de la salida (= x.n0 + h.n0). */
  nStart: number;
  /** Último índice n de la salida. */
  nEnd: number;
  /** Primer índice k del eje común, fijo para todos los fotogramas. */
  kStart: number;
  /** Último índice k del eje común. */
  kEnd: number;
  /** max|h[k]|, escala vertical de la pista del sistema. */
  hMax: number;
  /** max|x[n]|, escala vertical de la pista de la entrada. */
  xMax: number;
  /** Cota de magnitud del producto (hMax·xMax) para escalar su pista. */
  productMax: number;
  /** ¿h[k] toma valores negativos? (define dónde va la línea de cero). */
  hHasNeg: boolean;
  /** ¿x[n] toma valores negativos? */
  xHasNeg: boolean;
  /** ¿El producto puede ser negativo? (h o x con signo). */
  productHasNeg: boolean;
}

const maxAbs = (xs: number[]): number =>
  xs.reduce((m, v) => Math.max(m, Math.abs(v)), 0);

/**
 * Calcula el marco fijo de la animación: el rango del eje común k (lo bastante
 * ancho para contener el tren móvil en todas sus posiciones) y las escalas
 * verticales, de modo que las pistas no "salten" al cambiar n.
 */
export function convolutionLayout(
  x: DiscreteSignal,
  h: DiscreteSignal,
): ConvolutionLayout {
  const Lx = x.samples.length;
  const Lh = h.samples.length;

  const nStart = x.n0 + h.n0;
  const Ly = Lx > 0 && Lh > 0 ? Lx + Lh - 1 : 0;
  const nEnd = nStart + Math.max(Ly - 1, 0);

  // El tren x[n−k] alcanza su k mínimo en n = nStart y su k máximo en n = nEnd.
  // Fijar el eje a esa unión hace que el tren recorra el cuadro de izquierda a
  // derecha sin que h se mueva.
  const kStart = h.n0 - (Lx - 1);
  const kEnd = h.n0 + (Lh - 1) + (Lx - 1);

  const hMax = Math.max(maxAbs(h.samples), 1e-9);
  const xMax = Math.max(maxAbs(x.samples), 1e-9);

  return {
    nStart,
    nEnd,
    kStart: Math.min(kStart, kEnd),
    kEnd: Math.max(kStart, kEnd),
    hMax,
    xMax,
    productMax: hMax * xMax,
    hHasNeg: h.samples.some((v) => v < 0),
    xHasNeg: x.samples.some((v) => v < 0),
    productHasNeg:
      h.samples.some((v) => v < 0) || x.samples.some((v) => v < 0),
  };
}

/**
 * Construye el fotograma de la convolución para un desplazamiento n: recorre
 * todo el eje común, evalúa h[k] y x[n−k], y acumula su producto. La suma de
 * los productos solapados es exactamente la muestra de salida y[n].
 */
export function convolutionFrame(
  x: DiscreteSignal,
  h: DiscreteSignal,
  n: number,
): ConvolutionFrame {
  const { kStart, kEnd } = convolutionLayout(x, h);
  const Lx = x.samples.length;
  const Lh = h.samples.length;

  const taps: ConvolutionTap[] = [];
  const overlap: ConvolutionTap[] = [];
  let value = 0;
  let kFrom: number | null = null;
  let kTo: number | null = null;

  for (let k = kStart; k <= kEnd; k++) {
    const hi = k - h.n0;
    const xi = n - k - x.n0;
    const hOn = hi >= 0 && hi < Lh;
    const xOn = xi >= 0 && xi < Lx;
    const hv = hOn ? h.samples[hi] : 0;
    const xv = xOn ? x.samples[xi] : 0;
    const product = hv * xv;
    const tap: ConvolutionTap = { k, h: hv, x: xv, product, hOn, xOn };
    taps.push(tap);

    if (hOn && xOn) {
      overlap.push(tap);
      value += product;
      if (kFrom === null) kFrom = k;
      kTo = k;
    }
  }

  return {
    n,
    taps,
    overlap,
    value,
    overlapRange: kFrom !== null && kTo !== null ? [kFrom, kTo] : null,
  };
}
