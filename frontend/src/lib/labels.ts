import type { FilterType, InputSignalType } from '../types/signal';

const INPUT_LABELS: Record<InputSignalType, string> = {
  'exponencial-decreciente': 'Exponencial',
  'exponencial-creciente': 'Exp. creciente',
  escalon: 'Escalón',
  impulso: 'Impulso',
  senoide: 'Senoide',
  coseno: 'Coseno',
  'senoide-amortiguada': 'Senoide amort.',
  rampa: 'Rampa',
  'pulso-rectangular': 'Pulso rect.',
  triangular: 'Triangular',
  cuadrada: 'Cuadrada',
};

const FILTER_LABELS: Record<FilterType, string> = {
  'promediador-fir': 'Promediador',
  'promediador-ponderado': 'Ponderado',
  'pasa-altos-fir': 'Pasa-altos',
  diferenciador: 'Diferenciador',
  'iir-primer-orden': 'IIR',
  eco: 'Eco',
  'paso-todo': 'Paso-Todo',
};

export function inputLabel(type: InputSignalType): string {
  return INPUT_LABELS[type];
}

export function filterLabel(type: FilterType): string {
  return FILTER_LABELS[type];
}
