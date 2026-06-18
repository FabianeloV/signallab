import { useMemo } from 'react';
import { analyzeSpectrum } from '../lib/dsp';
import type { SpectralConfig, SpectralResult } from '../lib/dsp/spectral';

/**
 * Ejecuta el análisis espectral (muestreo → ventana → FFT) de forma reactiva
 * ante cambios en la configuración del módulo de Análisis Espectral.
 */
export function useSpectralAnalysis(config: SpectralConfig): SpectralResult {
  return useMemo(
    () => analyzeSpectrum(config),
    [
      config.signalType,
      config.analogFreq,
      config.samplingFreq,
      config.numSamples,
      config.window,
      config.fftPoints,
      config.scale,
    ],
  );
}
