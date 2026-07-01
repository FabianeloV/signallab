import type { InputSignalType, LTIMode } from '../types/signal';

/**
 * Especificación del deslizador del parámetro secundario de cada señal de
 * entrada. El significado del parámetro depende del tipo: factor a, frecuencia f
 * o ancho W. Los tipos sin parámetro (escalón, impulso, rampa) se omiten.
 */
export interface InputParamSpec {
  /** Símbolo LaTeX para la etiqueta del deslizador (a, f, W). */
  symbol: string;
  /** Texto descriptivo de la etiqueta. */
  label: string;
  min: number;
  max: number;
  step: number;
  /** Decimales a mostrar (0 = entero). */
  decimals: number;
  /** Valor inicial al seleccionar este tipo. */
  default: number;
}

const FREQ: Omit<InputParamSpec, 'default'> = {
  symbol: 'f',
  label: 'Frecuencia',
  min: 0.01,
  max: 0.5,
  step: 0.01,
  decimals: 2,
};

const WIDTH: Omit<InputParamSpec, 'default'> = {
  symbol: 'W',
  label: 'Ancho',
  min: 2,
  max: 24,
  step: 1,
  decimals: 0,
};

export const INPUT_PARAM_SPECS: Partial<Record<InputSignalType, InputParamSpec>> = {
  'exponencial-decreciente': {
    symbol: 'a',
    label: 'Factor de Decaimiento',
    min: 0.1,
    max: 0.99,
    step: 0.01,
    decimals: 2,
    default: 0.75,
  },
  'exponencial-creciente': {
    symbol: 'a',
    label: 'Factor de Crecimiento',
    min: 1.01,
    max: 1.4,
    step: 0.01,
    decimals: 2,
    default: 1.1,
  },
  senoide: { ...FREQ, default: 0.1 },
  coseno: { ...FREQ, default: 0.1 },
  'senoide-amortiguada': { ...FREQ, default: 0.12 },
  cuadrada: { ...FREQ, default: 0.05 },
  'pulso-rectangular': { ...WIDTH, default: 8 },
  triangular: { ...WIDTH, default: 12 },
};

/**
 * Etiquetas de los mismos parámetros en tiempo continuo (mismo rango
 * numérico; solo cambia el texto/unidad mostrada: Hz en vez de
 * ciclos/muestra, segundos en vez de muestras, 1/s en vez de "por muestra").
 */
const CONTINUOUS_LABELS: Partial<Record<InputSignalType, { label: string; symbol?: string }>> = {
  'exponencial-decreciente': { label: 'Factor de Decaimiento (1/s)' },
  'exponencial-creciente': { label: 'Factor de Crecimiento (1/s)' },
  senoide: { label: 'Frecuencia (Hz)' },
  coseno: { label: 'Frecuencia (Hz)' },
  'senoide-amortiguada': { label: 'Frecuencia (Hz)' },
  cuadrada: { label: 'Frecuencia (Hz)' },
  'pulso-rectangular': { label: 'Ancho (s)' },
  triangular: { label: 'Ancho (s)' },
};

/**
 * Especificación del deslizador del parámetro secundario para un tipo y modo
 * dados. En continuo se reutilizan los mismos rangos numéricos, solo cambia
 * la etiqueta/unidad mostrada.
 */
export function getInputParamSpec(
  type: InputSignalType,
  mode: LTIMode = 'discreto',
): InputParamSpec | undefined {
  const spec = INPUT_PARAM_SPECS[type];
  if (!spec) return undefined;
  if (mode !== 'continuo') return spec;
  const override = CONTINUOUS_LABELS[type];
  return override ? { ...spec, ...override } : spec;
}

/**
 * Valor por defecto del parámetro para un tipo dado, o `undefined` si el tipo no
 * usa parámetro (en ese caso se conserva el valor actual, que será ignorado).
 */
export function defaultInputParam(type: InputSignalType): number | undefined {
  return INPUT_PARAM_SPECS[type]?.default;
}
