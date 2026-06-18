import type { FilterType, InputSignalType } from '../types/signal';

const INPUT_LABELS: Record<InputSignalType, string> = {
  'exponencial-decreciente': 'Exponencial',
  escalon: 'Escalón',
  impulso: 'Impulso',
  senoide: 'Senoide',
  rampa: 'Rampa',
};

const FILTER_LABELS: Record<FilterType, string> = {
  'promediador-fir': 'Promediador',
  diferenciador: 'Diferenciador',
  'iir-primer-orden': 'IIR',
  'paso-todo': 'Paso-Todo',
};

export function inputLabel(type: InputSignalType): string {
  return INPUT_LABELS[type];
}

export function filterLabel(type: FilterType): string {
  return FILTER_LABELS[type];
}
