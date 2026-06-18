import type { BadgeTone } from '../components/atoms/Badge';

export type TheoremCategory =
  | 'Sistemas LTI'
  | 'Fourier (CTFT/DTFT)'
  | 'Muestreo'
  | 'Transformadas Z / Laplace';

export interface Theorem {
  id: string;
  title: string;
  category: { label: string; tone: BadgeTone };
  /** Categoría usada por los filtros de la página. */
  group: TheoremCategory;
  chapter: string;
  description: string;
  /** Fórmula en LaTeX. */
  formula: string;
  footerLabel: string;
  action: 'lab' | 'notes';
}

/**
 * Compendio de teoremas y propiedades fundamentales de Señales y Sistemas,
 * siguiendo la referencia de Oppenheim. Cada ficha se clasifica por categoría
 * y capítulo para los filtros de la documentación.
 */
export const THEOREMS: Theorem[] = [
  {
    id: 'convolucion',
    title: 'Teorema de Convolución',
    category: { label: 'DTFT', tone: 'blue' },
    group: 'Fourier (CTFT/DTFT)',
    chapter: 'Capítulo 5',
    description:
      'Establece que la convolución de dos secuencias en el dominio del tiempo es equivalente a la multiplicación de sus respectivas Transformadas de Fourier en Tiempo Discreto en el dominio de la frecuencia.',
    formula: 'y[n] = x[n] * h[n] \\;\\longleftrightarrow\\; Y(e^{j\\omega}) = X(e^{j\\omega})H(e^{j\\omega})',
    footerLabel: 'Demostración disponible',
    action: 'lab',
  },
  {
    id: 'nyquist',
    title: 'Teorema de Muestreo de Nyquist',
    category: { label: 'Muestreo', tone: 'pink' },
    group: 'Muestreo',
    chapter: 'Capítulo 7',
    description:
      'Una señal continua en el tiempo puede ser completamente recuperada a partir de sus muestras discretas si la frecuencia de muestreo es estrictamente mayor al doble de la frecuencia máxima de la señal.',
    formula: '\\omega_s > 2\\omega_M',
    footerLabel: 'Fórmula base',
    action: 'notes',
  },
  {
    id: 'parseval',
    title: 'Relación de Parseval',
    category: { label: 'DTFT', tone: 'blue' },
    group: 'Fourier (CTFT/DTFT)',
    chapter: 'Capítulo 5',
    description:
      'La energía total calculada en el dominio del tiempo es igual a la energía total calculada integrando la densidad espectral de energía en el dominio de la frecuencia sobre un periodo de 2π.',
    formula: '\\sum_{n} |x[n]|^2 = \\frac{1}{2\\pi}\\int_{2\\pi} |X(e^{j\\omega})|^2 \\, d\\omega',
    footerLabel: 'Demostración disponible',
    action: 'lab',
  },
  {
    id: 'estabilidad-lti',
    title: 'Estabilidad de Sistemas LTI',
    category: { label: 'Sistemas LTI', tone: 'green' },
    group: 'Sistemas LTI',
    chapter: 'Capítulo 2',
    description:
      'Un sistema LTI es estable en el sentido de entrada acotada, salida acotada (BIBO) si y solo si su respuesta al impulso es absolutamente sumable.',
    formula: '\\sum_{n=-\\infty}^{\\infty} |h[n]| < \\infty',
    footerLabel: 'Fórmula base',
    action: 'notes',
  },
  {
    id: 'transformada-z',
    title: 'Transformada Z y ROC',
    category: { label: 'Transformada Z', tone: 'purple' },
    group: 'Transformadas Z / Laplace',
    chapter: 'Capítulo 10',
    description:
      'Generaliza la DTFT usando variables complejas. La Región de Convergencia (ROC) determina para qué valores de z la suma infinita converge, siendo vital para analizar sistemas.',
    formula: 'X(z) = \\sum_{n=-\\infty}^{\\infty} x[n]z^{-n}',
    footerLabel: 'Definición formal',
    action: 'notes',
  },
  {
    id: 'diferenciacion',
    title: 'Diferenciación en el Tiempo',
    category: { label: 'CTFT', tone: 'amber' },
    group: 'Fourier (CTFT/DTFT)',
    chapter: 'Capítulo 4',
    description:
      'La derivada de una señal en el dominio del tiempo continuo corresponde a la multiplicación por jω de su Transformada de Fourier Continua (CTFT) en el dominio de la frecuencia.',
    formula: '\\frac{dx(t)}{dt} \\;\\longleftrightarrow\\; j\\omega\\, X(j\\omega)',
    footerLabel: 'Demostración disponible',
    action: 'notes',
  },
];

export const THEOREM_FILTERS: { id: string; label: string }[] = [
  { id: 'todos', label: 'Todos los Conceptos' },
  { id: 'Sistemas LTI', label: 'Sistemas LTI' },
  { id: 'Fourier (CTFT/DTFT)', label: 'Fourier (CTFT/DTFT)' },
  { id: 'Muestreo', label: 'Muestreo' },
  { id: 'Transformadas Z / Laplace', label: 'Transformadas Z / Laplace' },
];
