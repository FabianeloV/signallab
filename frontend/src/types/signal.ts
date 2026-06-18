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
  | 'escalon'
  | 'impulso'
  | 'senoide'
  | 'rampa';

/** Catálogo de sistemas / filtros h[n] disponibles. */
export type FilterType =
  | 'promediador-fir'
  | 'diferenciador'
  | 'iir-primer-orden'
  | 'paso-todo';

/** Ventanas de análisis para el módulo espectral. */
export type WindowType = 'rectangular' | 'hamming' | 'hanning' | 'blackman';

/** Señales de prueba del módulo de análisis espectral. */
export type TestSignalType =
  | 'senoide'
  | 'suma-senoides'
  | 'chirp'
  | 'cuadrada';

/** Escala del eje de magnitud en los espectros. */
export type MagnitudeScale = 'lineal' | 'logaritmica';
