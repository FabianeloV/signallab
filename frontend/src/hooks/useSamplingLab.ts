import { useMemo } from 'react';
import { aliasedFrequency, sampleContinuousFunction } from '../lib/dsp';
import type { SamplingResult } from '../lib/dsp/sampling';
import type { SamplingSignalType } from '../types/signal';

export interface SamplingConfig {
  signalType: SamplingSignalType;
  /** Frecuencia f0 en Hz. */
  f0: number;
  /** Frecuencia de muestreo Fs en Hz. */
  fs: number;
  /** Ventana de tiempo visible, en milisegundos. */
  windowMs: number;
}

export interface SamplingLabResult extends SamplingResult {
  /** ¿Se cumple el criterio de Nyquist (Fs ≥ 2·B)? */
  nyquistOk: boolean;
  /** Frecuencia percibida si hay aliasing (solo relevante cuando !nyquistOk). */
  aliasFreq: number;
}

/**
 * Muestrea la señal continua seleccionada y evalúa el criterio de Nyquist de
 * forma reactiva ante cambios de configuración, para el laboratorio de
 * Muestreo y Aliasing.
 */
export function useSamplingLab(config: SamplingConfig): SamplingLabResult {
  return useMemo(() => {
    const result = sampleContinuousFunction(
      config.signalType,
      config.f0,
      config.fs,
      config.windowMs,
    );
    return {
      ...result,
      nyquistOk: config.fs >= 2 * result.bandwidth,
      aliasFreq: aliasedFrequency(config.f0, config.fs),
    };
  }, [config.signalType, config.f0, config.fs, config.windowMs]);
}
