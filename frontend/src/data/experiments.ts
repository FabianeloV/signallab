export interface Experiment {
  id: string;
  title: string;
  type: 'lab' | 'spectral';
  description: string;
  timeAgo: string;
  preview: 'stem' | 'spectrum';
  /** Muestras opcionales para la miniatura de tipo stem. */
  previewSamples?: number[];
}

/**
 * Experimentos de ejemplo precargados. En una instalación real, esta lista se
 * poblaría desde almacenamiento del navegador o desde el backend.
 */
export const EXPERIMENTS: Experiment[] = [
  {
    id: 'fir-pasa-bajo',
    title: 'Filtro Pasa-Bajo FIR',
    type: 'lab',
    description:
      'Convolución de una señal cuadrada ruidosa con un filtro de ventana de Hamming. N = 64.',
    timeAgo: 'Hace 2 horas',
    preview: 'stem',
    previewSamples: [0.25, 0.9, 0.7, -0.4, -0.6, 0.3, 0.35],
  },
  {
    id: 'espectro-voz',
    title: 'Espectro de Señal de Voz',
    type: 'spectral',
    description: 'Análisis DTFT de una muestra de audio vocal con ventana de Hanning (1024 pts).',
    timeAgo: 'Ayer, 14:30',
    preview: 'spectrum',
  },
  {
    id: 'convolucion-escalon',
    title: 'Convolución de Escalón Discreto',
    type: 'lab',
    description:
      'Interacción entre una señal escalón unitario u[n] y una respuesta exponencial aⁿ u[n].',
    timeAgo: 'Ayer, 10:15',
    preview: 'stem',
    previewSamples: [0.3, 0.55, 0.7, 0.78, 0.84, 0.5, 0.4],
  },
  {
    id: 'ruido-blanco',
    title: 'Análisis de Ruido Blanco',
    type: 'spectral',
    description:
      'Comprobación de la densidad espectral de potencia plana de una señal aleatoria Gaussiana.',
    timeAgo: 'Hace 3 días',
    preview: 'spectrum',
  },
  {
    id: 'impulso-iir',
    title: 'Respuesta al Impulso IIR',
    type: 'lab',
    description:
      'Comportamiento asintótico de un sistema de respuesta infinita (IIR) de primer orden.',
    timeAgo: 'Hace 5 días',
    preview: 'stem',
    previewSamples: [0.95, 0.66, 0.46, 0.32, 0.22, 0.16, 0.11],
  },
  {
    id: 'modulacion-am',
    title: 'Modulación AM (Teorema Shift)',
    type: 'spectral',
    description:
      'Visualización del desplazamiento en frecuencia por multiplicación con una portadora cosenoidal.',
    timeAgo: 'Hace 1 semana',
    preview: 'spectrum',
  },
];
