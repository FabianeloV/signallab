import type { SamplingSignalType } from '../../types/signal';

/** Relación de frecuencia del segundo tono respecto a f0 en 'dos-tonos'. */
const SECOND_TONE_RATIO = 1.7;
const SECOND_TONE_AMPLITUDE = 0.6;

/** Número de puntos de la curva continua (densidad para verse suave). */
const CURVE_POINTS = 600;

function evaluate(type: SamplingSignalType, f0: number, t: number): number {
  switch (type) {
    case 'dos-tonos':
      return (
        Math.sin(2 * Math.PI * f0 * t) +
        SECOND_TONE_AMPLITUDE * Math.sin(2 * Math.PI * f0 * SECOND_TONE_RATIO * t)
      );
    case 'tono-puro':
    default:
      return Math.sin(2 * Math.PI * f0 * t);
  }
}

/** Ancho de banda B (Hz): la componente de frecuencia más alta presente en la señal. */
export function bandwidthOf(type: SamplingSignalType, f0: number): number {
  return type === 'dos-tonos' ? f0 * SECOND_TONE_RATIO : f0;
}

export interface SamplingResult {
  /** Curva continua densamente evaluada, para graficarse como línea suave. */
  curve: { t: number[]; values: number[] };
  /** Muestras reales tomadas de la misma función a t = k/Fs. */
  samples: { t: number; value: number }[];
  /** Ancho de banda B (Hz) de la señal seleccionada. */
  bandwidth: number;
}

/**
 * Evalúa la señal continua x(t) sobre una ventana de tiempo densa (para la
 * curva) y la muestrea a Fs (para los puntos de muestreo), usando en ambos
 * casos la misma función matemática: los puntos son muestras reales de la
 * curva mostrada, no una aproximación aparte.
 */
export function sampleContinuousFunction(
  type: SamplingSignalType,
  f0: number,
  fs: number,
  windowMs: number,
): SamplingResult {
  const duration = windowMs / 1000;

  const curve = {
    t: Array.from({ length: CURVE_POINTS }, (_, i) => (i / (CURVE_POINTS - 1)) * duration),
    values: [] as number[],
  };
  curve.values = curve.t.map((t) => evaluate(type, f0, t));

  const sampleCount = Math.max(0, Math.floor(duration * fs)) + 1;
  const samples = Array.from({ length: sampleCount }, (_, k) => {
    const t = k / fs;
    return { t, value: evaluate(type, f0, t) };
  }).filter((s) => s.t <= duration);

  return { curve, samples, bandwidth: bandwidthOf(type, f0) };
}

/**
 * Frecuencia percibida al muestrear un tono f0 a Fs (fórmula de plegado
 * estándar del aliasing): las frecuencias por encima de Fs/2 se "doblan"
 * hacia abajo. Por ejemplo, 700 Hz muestreados a 1000 Hz se perciben como
 * 300 Hz (|700 − 1000|).
 */
export function aliasedFrequency(f0: number, fs: number): number {
  if (fs <= 0) return f0;
  const folded = f0 % fs;
  const halfFs = fs / 2;
  return folded > halfFs ? fs - folded : folded;
}
