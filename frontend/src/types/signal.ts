/**
 * Tipos fundamentales del dominio de señales y sistemas.
 *
 * Una señal discreta se representa como un arreglo de muestras reales
 * acompañado del índice de la primera muestra (`n0`). Esto permite manejar
 * señales con soporte fuera del origen (por ejemplo, el resultado de una
 * convolución cuyo primer índice no es 0).
 */
export interface DiscreteSignal {
  /** Índice n correspondiente a `samples[0]`. */
  n0: number;
  /** Muestras reales de la señal. */
  samples: number[];
}

/**
 * Señal de tiempo continuo aproximada por una rejilla temporal densa: `dt`
 * es el paso de muestreo interno (segundos) y `samples[i]` corresponde a
 * `t = t0 + i·dt`. Las señales/sistemas que contienen deltas de Dirac
 * codifican esos deltas como una muestra de altura `1/dt` (para que la
 * convolución numérica los reproduzca exactamente) y además listan su
 * posición/peso real en `impulses`, que es lo que debe dibujarse (como
 * flecha) en vez de esa muestra desproporcionada.
 */
export interface ContinuousSignal {
  /** Instante t correspondiente a `samples[0]`, en segundos. */
  t0: number;
  /** Paso de muestreo interno, en segundos. */
  dt: number;
  /** Muestras reales de la señal. */
  samples: number[];
  /** Deltas de Dirac δ(t − t) · peso presentes en la señal, si los hay. */
  impulses?: { t: number; weight: number }[];
}

/** Modo de trabajo del Laboratorio LTI. */
export type LTIMode = 'discreto' | 'continuo';

/**
 * Espectro complejo evaluado sobre una rejilla de frecuencias normalizadas
 * Omega ∈ [-π, π]. Se guardan parte real/imaginaria y, por comodidad de
 * graficación, magnitud y fase ya calculadas.
 */
export interface Spectrum {
  /** Frecuencias normalizadas Ω en radianes/muestra, en [-π, π]. */
  omega: number[];
  /** |X(Ω)|. */
  magnitude: number[];
  /** ∠X(Ω) en radianes, en (-π, π]. */
  phase: number[];
  /** Parte real de X(Ω). */
  real: number[];
  /** Parte imaginaria de X(Ω). */
  imag: number[];
}

/** Catálogo de señales de entrada x[n] disponibles en el laboratorio. */
export type InputSignalType =
  | 'exponencial-decreciente'
  | 'exponencial-creciente'
  | 'escalon'
  | 'impulso'
  | 'senoide'
  | 'coseno'
  | 'senoide-amortiguada'
  | 'rampa'
  | 'pulso-rectangular'
  | 'triangular'
  | 'cuadrada';

/** Catálogo de sistemas / filtros h[n] disponibles. */
export type FilterType =
  | 'promediador-fir'
  | 'promediador-ponderado'
  | 'pasa-altos-fir'
  | 'diferenciador'
  | 'iir-primer-orden'
  | 'eco'
  | 'paso-todo';

/** Ventanas de análisis para el módulo espectral. */
export type WindowType = 'rectangular' | 'hamming' | 'hanning' | 'blackman';

/** Señales de prueba del módulo de análisis espectral. */
export type TestSignalType =
  | 'senoide'
  | 'coseno'
  | 'suma-senoides'
  | 'chirp'
  | 'cuadrada'
  | 'diente-sierra'
  | 'triangular'
  | 'am'
  | 'ruido';

/** Escala del eje de magnitud en los espectros. */
export type MagnitudeScale = 'lineal' | 'logaritmica';
