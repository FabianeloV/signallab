import type { BadgeTone } from '../components/atoms/Badge';

export type TheoremCategory =
  | 'Señales y Sistemas'
  | 'Sistemas LTI'
  | 'Series de Fourier'
  | 'Fourier (CTFT/DTFT)'
  | 'Muestreo';

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
 * cubriendo los capítulos 1 a 7 de Oppenheim & Willsky (señales y sistemas,
 * sistemas LTI, series de Fourier, transformadas CTFT/DTFT, caracterización en
 * frecuencia y muestreo). Cada ficha se clasifica por categoría y capítulo para
 * los filtros de la documentación.
 */
export const THEOREMS: Theorem[] = [
  // --- Capítulo 1: Señales y sistemas ---
  {
    id: 'linealidad-invariancia',
    title: 'Linealidad e Invariancia en el Tiempo',
    category: { label: 'Sistemas', tone: 'gray' },
    group: 'Señales y Sistemas',
    chapter: 'Capítulo 1',
    description:
      'Un sistema es lineal si cumple el principio de superposición (aditividad y homogeneidad) y es invariante en el tiempo si un desplazamiento de la entrada produce el mismo desplazamiento en la salida. Los sistemas que cumplen ambas (LTI) quedan completamente caracterizados por su respuesta al impulso.',
    formula:
      'a\\,x_1[n] + b\\,x_2[n] \\;\\longrightarrow\\; a\\,y_1[n] + b\\,y_2[n]',
    footerLabel: 'Definición formal',
    action: 'notes',
  },
  {
    id: 'impulso-unitario',
    title: 'Impulso Unitario y Propiedad de Selección',
    category: { label: 'Señales', tone: 'gray' },
    group: 'Señales y Sistemas',
    chapter: 'Capítulo 1',
    description:
      'Toda secuencia se descompone como suma de impulsos desplazados y escalados (propiedad de selección). El escalón unitario es la suma acumulada del impulso y el impulso es su primera diferencia.',
    formula:
      'x[n] = \\sum_{k=-\\infty}^{\\infty} x[k]\\,\\delta[n-k], \\qquad u[n] = \\sum_{k=-\\infty}^{n} \\delta[k]',
    footerLabel: 'Fórmula base',
    action: 'notes',
  },

  // --- Capítulo 2: Sistemas LTI ---
  {
    id: 'suma-convolucion',
    title: 'Suma de Convolución',
    category: { label: 'LTI', tone: 'green' },
    group: 'Sistemas LTI',
    chapter: 'Capítulo 2',
    description:
      'La salida de un sistema LTI de tiempo discreto es la convolución de la entrada con la respuesta al impulso h[n]: la superposición de las respuestas a cada impulso desplazado y escalado de la entrada.',
    formula:
      'y[n] = x[n] * h[n] = \\sum_{k=-\\infty}^{\\infty} x[k]\\,h[n-k]',
    footerLabel: 'Demostración disponible',
    action: 'lab',
  },
  {
    id: 'integral-convolucion',
    title: 'Integral de Convolución',
    category: { label: 'LTI', tone: 'green' },
    group: 'Sistemas LTI',
    chapter: 'Capítulo 2',
    description:
      'Análogo continuo de la suma de convolución: la salida de un sistema LTI de tiempo continuo es la convolución de la entrada con su respuesta al impulso h(t).',
    formula:
      'y(t) = x(t) * h(t) = \\int_{-\\infty}^{\\infty} x(\\tau)\\,h(t-\\tau)\\,d\\tau',
    footerLabel: 'Demostración disponible',
    action: 'lab',
  },
  {
    id: 'estabilidad-lti',
    title: 'Estabilidad BIBO de Sistemas LTI',
    category: { label: 'LTI', tone: 'green' },
    group: 'Sistemas LTI',
    chapter: 'Capítulo 2',
    description:
      'Un sistema LTI es estable en el sentido entrada-acotada/salida-acotada (BIBO) si y solo si su respuesta al impulso es absolutamente sumable (o integrable, en tiempo continuo).',
    formula: '\\sum_{n=-\\infty}^{\\infty} |h[n]| < \\infty',
    footerLabel: 'Fórmula base',
    action: 'notes',
  },

  // --- Capítulo 3: Series de Fourier ---
  {
    id: 'autofunciones',
    title: 'Exponenciales Complejas como Autofunciones',
    category: { label: 'Series de Fourier', tone: 'purple' },
    group: 'Series de Fourier',
    chapter: 'Capítulo 3',
    description:
      'Las exponenciales complejas son autofunciones de los sistemas LTI: la respuesta es la misma exponencial escalada por H, la respuesta en frecuencia. Esta propiedad es el fundamento del análisis de Fourier.',
    formula:
      'e^{j\\omega n} \\;\\longrightarrow\\; H(e^{j\\omega})\\,e^{j\\omega n}',
    footerLabel: 'Definición formal',
    action: 'notes',
  },
  {
    id: 'serie-fourier',
    title: 'Serie de Fourier de Señales Periódicas',
    category: { label: 'Series de Fourier', tone: 'purple' },
    group: 'Series de Fourier',
    chapter: 'Capítulo 3',
    description:
      'Toda señal periódica que satisface las condiciones de Dirichlet se representa como una combinación lineal de exponenciales complejas armónicamente relacionadas. Las ecuaciones de síntesis y análisis vinculan x(t) con sus coeficientes a_k.',
    formula:
      'x(t) = \\sum_{k=-\\infty}^{\\infty} a_k\\,e^{jk\\omega_0 t}, \\qquad a_k = \\frac{1}{T}\\int_{T} x(t)\\,e^{-jk\\omega_0 t}\\,dt',
    footerLabel: 'Fórmula base',
    action: 'notes',
  },

  // --- Capítulo 4: Transformada de Fourier de tiempo continuo (CTFT) ---
  {
    id: 'ctft',
    title: 'Transformada de Fourier de Tiempo Continuo',
    category: { label: 'CTFT', tone: 'amber' },
    group: 'Fourier (CTFT/DTFT)',
    chapter: 'Capítulo 4',
    description:
      'Representa señales aperiódicas como una superposición continua de exponenciales complejas. El par de análisis y síntesis relaciona la señal x(t) con su espectro X(jω).',
    formula:
      'X(j\\omega) = \\int_{-\\infty}^{\\infty} x(t)\\,e^{-j\\omega t}\\,dt, \\qquad x(t) = \\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty} X(j\\omega)\\,e^{j\\omega t}\\,d\\omega',
    footerLabel: 'Definición formal',
    action: 'notes',
  },
  {
    id: 'convolucion-ctft',
    title: 'Propiedad de Convolución (CTFT)',
    category: { label: 'CTFT', tone: 'amber' },
    group: 'Fourier (CTFT/DTFT)',
    chapter: 'Capítulo 4',
    description:
      'La convolución en el tiempo equivale a la multiplicación de los espectros en frecuencia. Es la base del filtrado: la respuesta en frecuencia H(jω) caracteriza por completo al sistema LTI.',
    formula:
      'y(t) = x(t) * h(t) \\;\\longleftrightarrow\\; Y(j\\omega) = X(j\\omega)\\,H(j\\omega)',
    footerLabel: 'Demostración disponible',
    action: 'notes',
  },
  {
    id: 'diferenciacion',
    title: 'Diferenciación en el Tiempo',
    category: { label: 'CTFT', tone: 'amber' },
    group: 'Fourier (CTFT/DTFT)',
    chapter: 'Capítulo 4',
    description:
      'La derivada de una señal en el dominio del tiempo corresponde a multiplicar su CTFT por jω en el dominio de la frecuencia, lo que acentúa las componentes de alta frecuencia.',
    formula: '\\frac{dx(t)}{dt} \\;\\longleftrightarrow\\; j\\omega\\, X(j\\omega)',
    footerLabel: 'Demostración disponible',
    action: 'notes',
  },

  // --- Capítulo 5: Transformada de Fourier de tiempo discreto (DTFT) ---
  {
    id: 'dtft',
    title: 'Transformada de Fourier de Tiempo Discreto',
    category: { label: 'DTFT', tone: 'blue' },
    group: 'Fourier (CTFT/DTFT)',
    chapter: 'Capítulo 5',
    description:
      'Análogo discreto de la CTFT. El espectro X(e^{jω}) es periódico con periodo 2π, reflejo de la naturaleza discreta de la secuencia en el tiempo.',
    formula:
      'X(e^{j\\omega}) = \\sum_{n=-\\infty}^{\\infty} x[n]\\,e^{-j\\omega n}, \\qquad x[n] = \\frac{1}{2\\pi}\\int_{2\\pi} X(e^{j\\omega})\\,e^{j\\omega n}\\,d\\omega',
    footerLabel: 'Definición formal',
    action: 'notes',
  },
  {
    id: 'convolucion',
    title: 'Teorema de Convolución (DTFT)',
    category: { label: 'DTFT', tone: 'blue' },
    group: 'Fourier (CTFT/DTFT)',
    chapter: 'Capítulo 5',
    description:
      'La convolución de dos secuencias en el dominio del tiempo equivale a la multiplicación de sus Transformadas de Fourier de Tiempo Discreto en el dominio de la frecuencia. Sustenta el análisis y diseño de filtros discretos.',
    formula:
      'y[n] = x[n] * h[n] \\;\\longleftrightarrow\\; Y(e^{j\\omega}) = X(e^{j\\omega})H(e^{j\\omega})',
    footerLabel: 'Demostración disponible',
    action: 'lab',
  },
  {
    id: 'parseval',
    title: 'Relación de Parseval (DTFT)',
    category: { label: 'DTFT', tone: 'blue' },
    group: 'Fourier (CTFT/DTFT)',
    chapter: 'Capítulo 5',
    description:
      'La energía total de una secuencia calculada en el tiempo es igual a la energía obtenida integrando su densidad espectral sobre un periodo de 2π. Expresa la conservación de la energía entre dominios.',
    formula:
      '\\sum_{n=-\\infty}^{\\infty} |x[n]|^2 = \\frac{1}{2\\pi}\\int_{2\\pi} |X(e^{j\\omega})|^2 \\, d\\omega',
    footerLabel: 'Demostración disponible',
    action: 'notes',
  },

  // --- Capítulo 6: Caracterización en tiempo y frecuencia ---
  {
    id: 'magnitud-fase',
    title: 'Magnitud, Fase y Respuesta en Frecuencia',
    category: { label: 'Frecuencia', tone: 'purple' },
    group: 'Fourier (CTFT/DTFT)',
    chapter: 'Capítulo 6',
    description:
      'Un sistema LTI altera la magnitud y la fase de cada componente espectral de la entrada: la magnitud escala y la fase desplaza. Una fase lineal corresponde a un retardo puro y preserva la forma de onda.',
    formula:
      'Y(j\\omega) = H(j\\omega)X(j\\omega): \\quad |Y| = |H|\\,|X|, \\;\\; \\angle Y = \\angle H + \\angle X',
    footerLabel: 'Definición formal',
    action: 'notes',
  },

  // --- Capítulo 7: Muestreo ---
  {
    id: 'nyquist',
    title: 'Teorema de Muestreo de Nyquist',
    category: { label: 'Muestreo', tone: 'pink' },
    group: 'Muestreo',
    chapter: 'Capítulo 7',
    description:
      'Una señal de banda limitada (con frecuencia máxima ω_M) se recupera por completo a partir de sus muestras si la frecuencia de muestreo es estrictamente mayor que el doble de ω_M (la tasa de Nyquist).',
    formula: '\\omega_s > 2\\omega_M',
    footerLabel: 'Fórmula base',
    action: 'notes',
  },
  {
    id: 'reconstruccion',
    title: 'Reconstrucción Ideal e Interpolación',
    category: { label: 'Muestreo', tone: 'pink' },
    group: 'Muestreo',
    chapter: 'Capítulo 7',
    description:
      'Si se cumple el criterio de Nyquist, un filtro pasa-bajas ideal reconstruye la señal continua interpolando las muestras con funciones sinc. Si no se cumple, las réplicas espectrales se solapan y aparece aliasing.',
    formula:
      'x_r(t) = \\sum_{n=-\\infty}^{\\infty} x[nT]\\,\\frac{\\sin\\!\\big(\\tfrac{\\pi}{T}(t-nT)\\big)}{\\tfrac{\\pi}{T}(t-nT)}',
    footerLabel: 'Demostración disponible',
    action: 'notes',
  },
];

export const THEOREM_FILTERS: { id: string; label: string }[] = [
  { id: 'todos', label: 'Todos los Conceptos' },
  { id: 'Señales y Sistemas', label: 'Señales y Sistemas' },
  { id: 'Sistemas LTI', label: 'Sistemas LTI' },
  { id: 'Series de Fourier', label: 'Series de Fourier' },
  { id: 'Fourier (CTFT/DTFT)', label: 'Fourier (CTFT/DTFT)' },
  { id: 'Muestreo', label: 'Muestreo' },
];
