import { useMemo } from 'react';
import {
  convolve,
  dtft,
  makeInputSignal,
  makeSystem,
} from '../lib/dsp';
import type {
  DiscreteSignal,
  FilterType,
  InputSignalType,
  Spectrum,
} from '../types/signal';

export interface LTIConfig {
  inputType: InputSignalType;
  /** Factor de decaimiento (a) o frecuencia, según el tipo de entrada. */
  inputParam: number;
  /** Longitud N de la señal de entrada. */
  length: number;
  filterType: FilterType;
  /** Orden del filtro (M). */
  order: number;
  /** Retraso del sistema (n_d). */
  delay: number;
}

export interface LTIResult {
  x: DiscreteSignal;
  h: DiscreteSignal;
  y: DiscreteSignal;
  X: Spectrum;
  H: Spectrum;
  Y: Spectrum;
}

const DTFT_POINTS = 256;

/**
 * Calcula, de forma reactiva, el comportamiento completo de un sistema LTI:
 * genera x[n] y h[n], obtiene la salida por convolución y[n] = x[n] * h[n],
 * y evalúa las tres DTFT sobre una misma rejilla. Por el teorema de
 * convolución, el espectro de la salida cumple Y(Ω) = X(Ω)·H(Ω).
 */
export function useLTISystem(config: LTIConfig): LTIResult {
  return useMemo(() => {
    const x = makeInputSignal(config.inputType, config.length, config.inputParam);
    const h = makeSystem(config.filterType, config.order, config.delay);
    const y = convolve(x, h);

    return {
      x,
      h,
      y,
      X: dtft(x, DTFT_POINTS),
      H: dtft(h, DTFT_POINTS),
      Y: dtft(y, DTFT_POINTS),
    };
  }, [
    config.inputType,
    config.inputParam,
    config.length,
    config.filterType,
    config.order,
    config.delay,
  ]);
}
