import { useMemo } from 'react';
import {
  convolve,
  convolveContinuous,
  ctft,
  dtft,
  makeContinuousInputSignal,
  makeContinuousSystem,
  makeInputSignal,
  makeSystem,
} from '../lib/dsp';
import type {
  ContinuousSignal,
  DiscreteSignal,
  FilterType,
  InputSignalType,
  LTIMode,
  Spectrum,
} from '../types/signal';

export interface LTIConfig {
  mode: LTIMode;
  inputType: InputSignalType;
  /** Factor de decaimiento (a) o frecuencia, según el tipo de entrada. */
  inputParam: number;
  /** Longitud N de la señal de entrada (discreto) o duración T en segundos (continuo). */
  length: number;
  filterType: FilterType;
  /** Orden del filtro (M, discreto) o duración de ventana T en segundos (continuo). */
  order: number;
  /** Retraso del sistema (n_d, discreto) o t_d en segundos (continuo). */
  delay: number;
}

interface DiscreteLTIResult {
  mode: 'discreto';
  x: DiscreteSignal;
  h: DiscreteSignal;
  y: DiscreteSignal;
  X: Spectrum;
  H: Spectrum;
  Y: Spectrum;
}

interface ContinuousLTIResult {
  mode: 'continuo';
  x: ContinuousSignal;
  h: ContinuousSignal;
  y: ContinuousSignal;
  X: Spectrum;
  H: Spectrum;
  Y: Spectrum;
}

export type LTIResult = DiscreteLTIResult | ContinuousLTIResult;

const DTFT_POINTS = 256;
const CTFT_POINTS = 256;
/** Resolución interna de la rejilla temporal continua (muestras densas por buffer). */
const CONTINUOUS_POINTS = 240;

/**
 * Calcula, de forma reactiva, el comportamiento completo de un sistema LTI:
 * genera x y h, obtiene la salida por convolución y evalúa las tres
 * transformadas de Fourier sobre una misma rejilla. Por el teorema de
 * convolución, el espectro de la salida cumple Y = X·H, tanto en tiempo
 * discreto (DTFT sobre Ω∈[-π,π]) como en tiempo continuo (CTFT sobre ω real).
 */
export function useLTISystem(config: LTIConfig): LTIResult {
  return useMemo(() => {
    if (config.mode === 'continuo') {
      const duration = Math.max(config.length, 1);
      const dt = duration / (CONTINUOUS_POINTS - 1);
      const x = makeContinuousInputSignal(
        config.inputType,
        dt,
        CONTINUOUS_POINTS,
        config.inputParam,
      );
      const h = makeContinuousSystem(config.filterType, config.order, config.delay, dt);
      const y = convolveContinuous(x, h);

      return {
        mode: 'continuo',
        x,
        h,
        y,
        X: ctft(x, undefined, CTFT_POINTS),
        H: ctft(h, undefined, CTFT_POINTS),
        Y: ctft(y, undefined, CTFT_POINTS),
      };
    }

    const x = makeInputSignal(config.inputType, config.length, config.inputParam);
    const h = makeSystem(config.filterType, config.order, config.delay);
    const y = convolve(x, h);

    return {
      mode: 'discreto',
      x,
      h,
      y,
      X: dtft(x, DTFT_POINTS),
      H: dtft(h, DTFT_POINTS),
      Y: dtft(y, DTFT_POINTS),
    };
  }, [
    config.mode,
    config.inputType,
    config.inputParam,
    config.length,
    config.filterType,
    config.order,
    config.delay,
  ]);
}
