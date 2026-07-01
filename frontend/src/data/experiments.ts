import type { LTIConfig } from '../hooks/useLTISystem';
import type { SpectralConfig } from '../lib/dsp/spectral';

interface BaseExperiment {
  id: string;
  title: string;
  description: string;
  preview: 'stem' | 'spectrum';
  /** Muestras opcionales para la miniatura de tipo stem. */
  previewSamples?: number[];
}

/** Experimento del Laboratorio LTI: lleva una configuración completa de `LTIConfig`. */
export interface LabExperiment extends BaseExperiment {
  type: 'lab';
  config: LTIConfig;
}

/** Experimento de Análisis Espectral: lleva una configuración de `SpectralConfig`. */
export interface SpectralExperiment extends BaseExperiment {
  type: 'spectral';
  config: SpectralConfig;
}

export type Experiment = LabExperiment | SpectralExperiment;

/**
 * Experimentos de ejemplo que ilustran los teoremas destacados en la sección de
 * Reportes y Teoremas. Cada uno define una configuración real y reproducible
 * (`config`) que "Cargar Experimento" aplica directamente en el módulo
 * correspondiente. Son escenarios de muestra: la aplicación no persiste
 * experimentos del usuario.
 */
export const EXPERIMENTS: Experiment[] = [
  // --- Laboratorio LTI (convolución, respuesta al impulso, estabilidad) ---
  {
    id: 'fir-pasa-bajo',
    title: 'Filtro Promediador FIR (Pasa-Bajo)',
    type: 'lab',
    description:
      'Una senoide discreta de 0,12 ciclos/muestra se procesa con un promediador móvil FIR de 7 coeficientes. Al ser un filtro pasa-bajo, atenúa las oscilaciones rápidas: la salida y[n] = x[n] * h[n] es una versión suavizada y de menor amplitud. Ilustra la propiedad de convolución (convolucionar en el tiempo equivale a multiplicar X·H en frecuencia).',
    preview: 'stem',
    previewSamples: [0.2, 0.6, 0.85, 0.6, 0.2, -0.2, -0.5],
    config: {
      mode: 'discreto',
      inputType: 'senoide',
      inputParam: 0.12,
      length: 32,
      filterType: 'promediador-fir',
      order: 6,
      delay: 0,
    },
  },
  {
    id: 'impulso-fir',
    title: 'Respuesta al Impulso de un FIR',
    type: 'lab',
    description:
      'Se aplica un impulso unitario δ[n] a un promediador FIR de orden 8. Como δ[n] es el elemento neutro de la convolución, la salida es exactamente la respuesta al impulso del sistema: h[n] = 1/9 para 0 ≤ n ≤ 8, un pulso rectangular. Demuestra la propiedad de selección del impulso y cómo h[n] caracteriza por completo a un sistema LTI.',
    preview: 'stem',
    previewSamples: [0.45, 0.45, 0.45, 0.45, 0.45, 0.45, 0.45],
    config: {
      mode: 'discreto',
      inputType: 'impulso',
      inputParam: 1,
      length: 24,
      filterType: 'promediador-fir',
      order: 8,
      delay: 0,
    },
  },
  {
    id: 'convolucion-escalon',
    title: 'Convolución de Escalón (Respuesta al Escalón)',
    type: 'lab',
    description:
      'Respuesta de un promediador FIR ante un escalón unitario u[n]. La salida es la suma acumulada de la respuesta al impulso: crece de forma lineal durante los primeros M+1 puntos hasta alcanzar el régimen permanente. Ejemplifica la suma de convolución y la relación entre la respuesta al impulso y la respuesta al escalón.',
    preview: 'stem',
    previewSamples: [0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1.0],
    config: {
      mode: 'discreto',
      inputType: 'escalon',
      inputParam: 1,
      length: 24,
      filterType: 'promediador-fir',
      order: 6,
      delay: 0,
    },
  },
  {
    id: 'impulso-iir',
    title: 'Respuesta al Impulso IIR y Estabilidad BIBO',
    type: 'lab',
    description:
      'Respuesta al impulso de un sistema IIR recursivo de primer orden, h[n] = 0,7ⁿ·u[n]. Decae geométricamente y es absolutamente sumable —Σ|h[n]| = 1/(1−0,7) ≈ 3,33 < ∞—, por lo que el sistema es estable en el sentido BIBO. Contrasta el carácter de respuesta infinita (IIR) frente a la respuesta finita del FIR.',
    preview: 'stem',
    previewSamples: [1.0, 0.7, 0.49, 0.34, 0.24, 0.17, 0.12],
    config: {
      mode: 'discreto',
      inputType: 'impulso',
      inputParam: 1,
      length: 24,
      filterType: 'iir-primer-orden',
      order: 12,
      delay: 0,
    },
  },
  {
    id: 'diferenciador-bordes',
    title: 'Diferenciador y Detección de Bordes',
    type: 'lab',
    description:
      'Un diferenciador de primer orden, h[n] = δ[n] − δ[n−1], se aplica a un escalón de longitud finita. La salida es la primera diferencia: un impulso positivo en el flanco de subida (n = 0) y otro negativo donde termina el escalón finito, mientras que los tramos constantes se anulan. Es el análogo discreto de la diferenciación, que realza los cambios bruscos (bordes) y suprime las zonas planas.',
    preview: 'stem',
    previewSamples: [1.0, 0, 0, 0, 0, 0, -1.0],
    config: {
      mode: 'discreto',
      inputType: 'escalon',
      inputParam: 1,
      length: 20,
      filterType: 'diferenciador',
      order: 1,
      delay: 0,
    },
  },
  {
    id: 'pasa-bajos-continuo',
    title: 'Filtro Pasa-Bajas RC: Suavizado de una Onda Cuadrada',
    type: 'lab',
    description:
      'Una onda cuadrada (rica en armónicos de alta frecuencia) se filtra con un sistema RC de primer orden h(t) = a·e^(−at)·u(t), un filtro pasa-bajas continuo clásico. Al atenuar los armónicos altos, la salida y(t) = x(t) * h(t) se redondea, aproximándose a su componente fundamental (senoidal). Ilustra el filtrado pasa-bajas en tiempo continuo y su efecto en el dominio de la frecuencia (H(jω) atenúa |X(jω)| en alta frecuencia).',
    preview: 'stem',
    previewSamples: [1, 0.9, 0.6, 0.2, -0.2, -0.6, -0.9],
    config: {
      mode: 'continuo',
      inputType: 'cuadrada',
      inputParam: 0.1,
      length: 30,
      filterType: 'iir-primer-orden',
      order: 6,
      delay: 0,
    },
  },
  {
    id: 'pasa-altos-continua',
    title: 'Filtro Pasa-Altas FIR: Eliminación de Nivel DC',
    type: 'lab',
    description:
      'Un filtro pasa-altas por inversión espectral, h[n] = δ[n] − 1/(M+1), se aplica a una onda cuadrada. Su ganancia en continua (DC) es cero, por lo que elimina el nivel medio de la señal y deja pasar únicamente sus componentes de alta frecuencia (los flancos y la oscilación), a diferencia del diferenciador, que solo resalta los bordes.',
    preview: 'stem',
    previewSamples: [0.9, 0.5, -0.1, -0.6, -0.3, 0.4, 0.8],
    config: {
      mode: 'discreto',
      inputType: 'cuadrada',
      inputParam: 0.08,
      length: 32,
      filterType: 'pasa-altos-fir',
      order: 6,
      delay: 0,
    },
  },
  {
    id: 'recuperacion-senal',
    title: 'Recuperación de Señal: Filtro de Reconstrucción',
    type: 'lab',
    description:
      'Un pulso rectangular angosto —análogo al retenedor de orden cero (ZOH) que produce un conversor D/A a partir de una muestra— se pasa por un filtro pasa-bajas RC de reconstrucción. El filtrado suaviza los bordes abruptos y "recupera" una forma continua, el mismo principio (filtro pasa-bajas ideal) que permite reconstruir una señal analógica a partir de sus muestras cuando se cumple el criterio de Nyquist.',
    preview: 'stem',
    previewSamples: [0, 0.3, 0.7, 0.95, 0.8, 0.4, 0.1],
    config: {
      mode: 'continuo',
      inputType: 'pulso-rectangular',
      inputParam: 2,
      length: 10,
      filterType: 'iir-primer-orden',
      order: 6,
      delay: 0,
    },
  },

  // --- Análisis Espectral (Fourier, resolución, muestreo) ---
  {
    id: 'tono-puro',
    title: 'Tono Puro y Fugas Espectrales',
    type: 'spectral',
    description:
      'DTFT de una senoide de 250 Hz muestreada a 1 kHz (ω0 = π/2 rad/muestra), enventanada con una ventana de Hanning. El espectro muestra un pico nítido en ±ω0; el enventanado reduce las fugas espectrales (energía que se dispersa a frecuencias vecinas al truncar la señal). Cambia la ventana a rectangular para observar el efecto contrario.',
    preview: 'spectrum',
    config: {
      signalType: 'senoide',
      analogFreq: 250,
      samplingFreq: 1000,
      numSamples: 64,
      window: 'hanning',
      fftPoints: 1024,
      scale: 'logaritmica',
    },
  },
  {
    id: 'dos-tonos',
    title: 'Suma de Senoides y Resolución',
    type: 'spectral',
    description:
      'Señal compuesta por dos senoides, x[n] = sin(ω0 n) + ½·sin(2,5 ω0 n), con f0 = 200 Hz y Fs = 2 kHz. El espectro presenta dos picos diferenciados, evidenciando la linealidad de la transformada de Fourier: el espectro de la suma es la suma de los espectros. Permite estudiar la resolución en frecuencia según N y la ventana.',
    preview: 'spectrum',
    config: {
      signalType: 'suma-senoides',
      analogFreq: 200,
      samplingFreq: 2000,
      numSamples: 128,
      window: 'hamming',
      fftPoints: 1024,
      scale: 'logaritmica',
    },
  },
  {
    id: 'onda-cuadrada',
    title: 'Onda Cuadrada y Armónicos (Serie de Fourier)',
    type: 'spectral',
    description:
      'Espectro de una onda cuadrada de 100 Hz. Aparecen únicamente los armónicos impares (f0, 3f0, 5f0, …) con amplitudes que decaen como 1/k, tal como predicen los coeficientes de su serie de Fourier. La concentración de energía en pocos armónicos y el truncamiento se relacionan con el fenómeno de Gibbs.',
    preview: 'spectrum',
    config: {
      signalType: 'cuadrada',
      analogFreq: 100,
      samplingFreq: 2000,
      numSamples: 128,
      window: 'hanning',
      fftPoints: 1024,
      scale: 'logaritmica',
    },
  },
  {
    id: 'muestreo-aliasing',
    title: 'Submuestreo y Aliasing (Nyquist)',
    type: 'spectral',
    description:
      'Una senoide de 700 Hz se muestrea a solo 1 kHz, por debajo de la tasa de Nyquist (2 × 700 = 1400 Hz). Al violarse el criterio, la componente se solapa y su pico espectral aparece en 300 Hz (|700 − 1000|) en lugar de 700 Hz: aliasing. Demuestra por qué se requiere ωs > 2ω_M para poder reconstruir la señal.',
    preview: 'spectrum',
    config: {
      signalType: 'senoide',
      analogFreq: 700,
      samplingFreq: 1000,
      numSamples: 64,
      window: 'hanning',
      fftPoints: 1024,
      scale: 'logaritmica',
    },
  },
  {
    id: 'chirp-barrido',
    title: 'Barrido de Frecuencia (Chirp)',
    type: 'spectral',
    description:
      'Señal chirp cuya frecuencia instantánea barre linealmente de 0 hasta f0 = 400 Hz a lo largo de N muestras. Su espectro de magnitud ocupa una banda ancha en lugar de un pico, ilustrando que el contenido frecuencial evoluciona en el tiempo y motivando el análisis tiempo-frecuencia (caracterización de señales del Capítulo 6).',
    preview: 'spectrum',
    config: {
      signalType: 'chirp',
      analogFreq: 400,
      samplingFreq: 2000,
      numSamples: 256,
      window: 'hanning',
      fftPoints: 1024,
      scale: 'logaritmica',
    },
  },
];
