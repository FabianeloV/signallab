import type { DiscreteSignal, Spectrum } from '../../types/signal';

/**
 * Transformada de Fourier en Tiempo Discreto (DTFT) evaluada directamente
 * sobre una rejilla densa de frecuencias Ω ∈ [-π, π]:
 *
 *      X(Ω) = Σ_n x[n] · e^{-jΩn}
 *
 * A diferencia de la FFT (que muestrea el espectro en N bins), la evaluación
 * directa produce una curva suave —ideal para visualizar la forma del espectro
 * de señales cortas, tal como aparece en el laboratorio LTI—. El costo es
 * O(numPoints · longitud), perfectamente asumible para las longitudes de este
 * proyecto.
 */
export function dtft(signal: DiscreteSignal, numPoints = 512): Spectrum {
  const { samples, n0 } = signal;
  const omega: number[] = new Array(numPoints);
  const real: number[] = new Array(numPoints);
  const imag: number[] = new Array(numPoints);
  const magnitude: number[] = new Array(numPoints);
  const phase: number[] = new Array(numPoints);

  for (let k = 0; k < numPoints; k++) {
    // Ω recorre [-π, π].
    const w = -Math.PI + (2 * Math.PI * k) / (numPoints - 1);
    let re = 0;
    let im = 0;
    for (let i = 0; i < samples.length; i++) {
      const n = n0 + i;
      const angle = -w * n;
      re += samples[i] * Math.cos(angle);
      im += samples[i] * Math.sin(angle);
    }
    omega[k] = w;
    real[k] = re;
    imag[k] = im;
    magnitude[k] = Math.hypot(re, im);
    phase[k] = Math.atan2(im, re);
  }

  return { omega, magnitude, phase, real, imag };
}

/**
 * Producto punto a punto de dos espectros evaluados sobre la MISMA rejilla.
 * Sirve para comprobar numéricamente el teorema de convolución:
 *      Y(Ω) = X(Ω) · H(Ω)
 */
export function multiplySpectra(a: Spectrum, b: Spectrum): Spectrum {
  const n = a.omega.length;
  const real = new Array(n);
  const imag = new Array(n);
  const magnitude = new Array(n);
  const phase = new Array(n);
  for (let k = 0; k < n; k++) {
    const re = a.real[k] * b.real[k] - a.imag[k] * b.imag[k];
    const im = a.real[k] * b.imag[k] + a.imag[k] * b.real[k];
    real[k] = re;
    imag[k] = im;
    magnitude[k] = Math.hypot(re, im);
    phase[k] = Math.atan2(im, re);
  }
  return { omega: a.omega.slice(), magnitude, phase, real, imag };
}

/** Convierte magnitud lineal a decibelios con piso para evitar log(0). */
export function toDecibels(magnitude: number[], floorDb = -80): number[] {
  const peak = Math.max(...magnitude, 1e-12);
  return magnitude.map((m) => {
    const db = 20 * Math.log10((m + 1e-12) / peak);
    return Math.max(db, floorDb);
  });
}
