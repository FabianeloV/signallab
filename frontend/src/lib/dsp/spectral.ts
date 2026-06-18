import type {
  MagnitudeScale,
  Spectrum,
  TestSignalType,
  WindowType,
} from '../../types/signal';
import { applyWindow } from './windows';
import { fft, fftShift, padToPow2 } from './fft';
import { toDecibels } from './dtft';

export interface SpectralConfig {
  signalType: TestSignalType;
  /** Frecuencia analógica f0 en Hz. */
  analogFreq: number;
  /** Frecuencia de muestreo Fs en Hz. */
  samplingFreq: number;
  /** Número de muestras N de la señal en el tiempo. */
  numSamples: number;
  window: WindowType;
  /** Puntos de FFT (zero-padding), potencia de dos. */
  fftPoints: number;
  scale: MagnitudeScale;
}

export interface SpectralResult {
  /** Señal en el dominio del tiempo (ya muestreada, sin ventana). */
  timeSignal: number[];
  /** Espectro centrado en cero, listo para graficar. */
  spectrum: Spectrum;
  /** Frecuencia normalizada teórica del tono principal (ω0 = 2π f0 / Fs). */
  normalizedFreq: number;
}

/**
 * Genera la señal de prueba muestreada a Fs a partir de una frecuencia
 * analógica f0. La frecuencia normalizada resultante es ω0 = 2π f0 / Fs.
 */
export function generateTestSignal(config: SpectralConfig): number[] {
  const { signalType, analogFreq, samplingFreq, numSamples } = config;
  const w0 = (2 * Math.PI * analogFreq) / samplingFreq;
  const N = numSamples;

  switch (signalType) {
    case 'senoide':
      return Array.from({ length: N }, (_, n) => Math.sin(w0 * n));
    case 'suma-senoides':
      return Array.from(
        { length: N },
        (_, n) => Math.sin(w0 * n) + 0.5 * Math.sin(2.5 * w0 * n),
      );
    case 'chirp': {
      // Barrido lineal de frecuencia de 0 a w0 a lo largo de N muestras.
      return Array.from({ length: N }, (_, n) => {
        const inst = (w0 * n * n) / (2 * N);
        return Math.sin(inst);
      });
    }
    case 'cuadrada':
      return Array.from({ length: N }, (_, n) =>
        Math.sign(Math.sin(w0 * n)) || 1,
      );
    default:
      return Array.from({ length: N }, (_, n) => Math.sin(w0 * n));
  }
}

/**
 * Ejecuta el pipeline completo de análisis espectral:
 * muestreo → ventana → zero-padding → FFT → fftshift → escala.
 */
export function analyzeSpectrum(config: SpectralConfig): SpectralResult {
  const timeSignal = generateTestSignal(config);
  const windowed = applyWindow(timeSignal, config.window);

  const re = padToPow2(windowed, config.fftPoints);
  const im = new Array(re.length).fill(0);
  fft(re, im);

  const N = re.length;
  // Eje de frecuencias normalizadas de la FFT, centrado en cero.
  const omegaRaw = Array.from({ length: N }, (_, k) => (2 * Math.PI * k) / N);
  const omegaCentered = omegaRaw.map((w) => (w >= Math.PI ? w - 2 * Math.PI : w));

  const reS = fftShift(re);
  const imS = fftShift(im);
  const omega = fftShift(omegaCentered);

  const magnitudeLinear = reS.map((r, k) => Math.hypot(r, imS[k]));
  const phase = reS.map((r, k) => Math.atan2(imS[k], r));
  const magnitude =
    config.scale === 'logaritmica' ? toDecibels(magnitudeLinear) : magnitudeLinear;

  return {
    timeSignal,
    spectrum: {
      omega,
      magnitude,
      phase,
      real: reS,
      imag: imS,
    },
    normalizedFreq: (2 * Math.PI * config.analogFreq) / config.samplingFreq,
  };
}
