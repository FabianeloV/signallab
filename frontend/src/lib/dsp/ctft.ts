import type { ContinuousSignal, Spectrum } from '../../types/signal';

/**
 * Rango de frecuencia angular por defecto ± ω_max (rad/s) sobre el que se
 * evalúa la CTFT. A diferencia de la DTFT (periódica, natural en [-π, π]),
 * el espectro continuo es aperiódico y no acotado; se fija un rango
 * generoso para los parámetros por defecto del laboratorio, sin exponer un
 * control adicional en la interfaz (simplificación deliberada).
 */
export const CTFT_OMEGA_MAX = 40;

/**
 * Transformada de Fourier en Tiempo Continuo (CTFT), aproximada por
 * integración de Riemann sobre la rejilla temporal densa de la señal:
 *
 *      X(jω) = ∫ x(t)·e^{-jωt} dt  ≈  dt · Σ x[t_i]·e^{-jω t_i}
 *
 * Mismo patrón de evaluación directa que `dtft()`, pero integrando con `dt`
 * sobre tiempos reales en vez de índices enteros, y sobre un rango de
 * frecuencia continuo (no periódico).
 */
export function ctft(
  signal: ContinuousSignal,
  omegaMax = CTFT_OMEGA_MAX,
  numPoints = 256,
): Spectrum {
  const { samples, t0, dt } = signal;
  const omega: number[] = new Array(numPoints);
  const real: number[] = new Array(numPoints);
  const imag: number[] = new Array(numPoints);
  const magnitude: number[] = new Array(numPoints);
  const phase: number[] = new Array(numPoints);

  for (let k = 0; k < numPoints; k++) {
    const w = -omegaMax + (2 * omegaMax * k) / (numPoints - 1);
    let re = 0;
    let im = 0;
    for (let i = 0; i < samples.length; i++) {
      const t = t0 + i * dt;
      const angle = -w * t;
      re += samples[i] * Math.cos(angle);
      im += samples[i] * Math.sin(angle);
    }
    omega[k] = w;
    real[k] = re * dt;
    imag[k] = im * dt;
    magnitude[k] = Math.hypot(re * dt, im * dt);
    phase[k] = Math.atan2(im, re);
  }

  return { omega, magnitude, phase, real, imag };
}
