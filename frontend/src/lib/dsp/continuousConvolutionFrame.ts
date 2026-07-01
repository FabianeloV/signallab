import { convolutionFrame, convolutionLayout } from './convolutionFrame';
import type { ConvolutionFrame, ConvolutionLayout } from './convolutionFrame';
import type { ContinuousSignal } from '../../types/signal';

/**
 * Geometría de la convolución continua como "señal deslizante", reutilizando
 * literalmente `convolutionLayout`/`convolutionFrame` del motor discreto
 * sobre los índices enteros de la rejilla temporal compartida (mismo `dt`
 * en x y h). El eje k de esos resultados representa τ = k·dt (segundos); el
 * componente que dibuja el fotograma es responsable de esa conversión.
 */
function toDiscrete(sig: ContinuousSignal) {
  return { n0: Math.round(sig.t0 / sig.dt), samples: sig.samples };
}

/** Layout fijo de la animación, expresado en índices enteros (multiplicar por `dt` para segundos). */
export function continuousConvolutionLayout(
  x: ContinuousSignal,
  h: ContinuousSignal,
): ConvolutionLayout & { dt: number } {
  return { ...convolutionLayout(toDiscrete(x), toDiscrete(h)), dt: x.dt };
}

/**
 * Fotograma de la convolución continua para el índice de salida `n`
 * (t = n·dt). El valor acumulado se reescala por `dt` para aproximar la
 * integral y(t) = ∫ x(τ)·h(t−τ) dτ; los taps individuales conservan la
 * amplitud real de h(τ) y x(t−τ) (sin escalar) para graficarse tal cual.
 */
export function continuousConvolutionFrame(
  x: ContinuousSignal,
  h: ContinuousSignal,
  n: number,
): ConvolutionFrame {
  const frame = convolutionFrame(toDiscrete(x), toDiscrete(h), n);
  return { ...frame, value: frame.value * x.dt };
}
