import type { FilterType, InputSignalType, LTIMode, TestSignalType } from '../types/signal';

/**
 * Forma matemática (en LaTeX) de cada opción de señal y sistema. Se muestra
 * junto a los selectores para que el usuario reconozca la expresión de x[n] o
 * h[n] correspondiente a la opción elegida.
 */

const INPUT_FORMULAS: Record<InputSignalType, string> = {
  'exponencial-decreciente': 'x[n] = a^{n}\\,u[n]',
  'exponencial-creciente': 'x[n] = a^{n}\\,u[n], \\quad a > 1',
  escalon: 'x[n] = u[n]',
  impulso: 'x[n] = \\delta[n]',
  senoide: 'x[n] = \\sin(2\\pi f n)',
  coseno: 'x[n] = \\cos(2\\pi f n)',
  'senoide-amortiguada': 'x[n] = (0.85)^{n}\\sin(2\\pi f n)\\,u[n]',
  rampa: 'x[n] = n\\,u[n]',
  'pulso-rectangular': 'x[n] = u[n] - u[n-W]',
  triangular:
    'x[n] = 1 - \\dfrac{|\\,n - W/2\\,|}{W/2}, \\quad 0 \\le n \\le W',
  cuadrada: 'x[n] = \\operatorname{sgn}\\!\\big(\\sin(2\\pi f n)\\big)',
};

const SYSTEM_FORMULAS: Record<FilterType, string> = {
  'promediador-fir': 'h[n] = \\dfrac{1}{M+1}, \\quad 0 \\le n \\le M',
  'promediador-ponderado':
    'h[n] \\propto 1 - \\dfrac{|\\,n - M/2\\,|}{M/2 + 1}, \\quad 0 \\le n \\le M',
  'pasa-altos-fir':
    'h[n] = \\delta[n] - \\dfrac{1}{M+1}, \\quad 0 \\le n \\le M',
  diferenciador: 'h[n] = \\delta[n] - \\delta[n-1]',
  'iir-primer-orden': 'h[n] = (0.7)^{n}\\,u[n]',
  eco: 'h[n] = \\delta[n] + 0.6\\,\\delta[n - n_d]',
  'paso-todo': 'h[n] = \\delta[n - n_d]',
};

const INPUT_FORMULAS_CONTINUOUS: Record<InputSignalType, string> = {
  'exponencial-decreciente': 'x(t) = a^{t}\\,u(t)',
  'exponencial-creciente': 'x(t) = a^{t}\\,u(t), \\quad a > 1',
  escalon: 'x(t) = u(t)',
  impulso: 'x(t) = \\delta(t)',
  senoide: 'x(t) = \\sin(2\\pi f t)',
  coseno: 'x(t) = \\cos(2\\pi f t)',
  'senoide-amortiguada': 'x(t) = e^{-0.85\\,t}\\sin(2\\pi f t)\\,u(t)',
  rampa: 'x(t) = t\\,u(t)',
  'pulso-rectangular': 'x(t) = u(t) - u(t-W)',
  triangular:
    'x(t) = 1 - \\dfrac{|\\,t - W/2\\,|}{W/2}, \\quad 0 \\le t \\le W',
  cuadrada: 'x(t) = \\operatorname{sgn}\\!\\big(\\sin(2\\pi f t)\\big)',
};

const SYSTEM_FORMULAS_CONTINUOUS: Record<FilterType, string> = {
  'promediador-fir': 'h(t) = \\dfrac{1}{T}, \\quad 0 \\le t \\le T',
  'promediador-ponderado':
    'h(t) \\propto 1 - \\dfrac{|\\,t - T/2\\,|}{T/2}, \\quad 0 \\le t \\le T',
  'pasa-altos-fir':
    'h(t) = \\delta(t) - \\dfrac{1}{T}, \\quad 0 \\le t \\le T',
  diferenciador: 'h(t) \\approx \\dfrac{\\delta(t) - \\delta(t-dt)}{dt}',
  'iir-primer-orden': 'h(t) = (0.7)\\,e^{-0.7\\,t}\\,u(t)',
  eco: 'h(t) = \\delta(t) + 0.6\\,\\delta(t - t_d)',
  'paso-todo': 'h(t) = \\delta(t - t_d)',
};

const W0 = '\\omega_0 = 2\\pi f_0 / F_s';

const SPECTRAL_FORMULAS: Record<TestSignalType, string> = {
  senoide: `\\begin{gathered} x[n] = \\sin(\\omega_0 n) \\\\ ${W0} \\end{gathered}`,
  coseno: `\\begin{gathered} x[n] = \\cos(\\omega_0 n) \\\\ ${W0} \\end{gathered}`,
  'suma-senoides': `\\begin{gathered} x[n] = \\sin(\\omega_0 n) + \\tfrac{1}{2}\\sin(2.5\\,\\omega_0 n) \\\\ ${W0} \\end{gathered}`,
  chirp: `\\begin{gathered} x[n] = \\sin\\!\\left(\\dfrac{\\omega_0\\, n^{2}}{2N}\\right) \\\\ ${W0} \\end{gathered}`,
  cuadrada: `\\begin{gathered} x[n] = \\operatorname{sgn}\\!\\big(\\sin(\\omega_0 n)\\big) \\\\ ${W0} \\end{gathered}`,
  'diente-sierra': `\\begin{gathered} x[n] = 2\\Big(\\tfrac{f_0\\, n}{F_s} \\bmod 1\\Big) - 1 \\end{gathered}`,
  triangular: `\\begin{gathered} x[n] = 1 - 4\\,\\Big|\\,(\\tfrac{f_0\\, n}{F_s} \\bmod 1) - \\tfrac{1}{2}\\,\\Big| \\end{gathered}`,
  am: `\\begin{gathered} x[n] = \\big[\\,1 + \\tfrac{1}{2}\\cos(\\omega_m n)\\,\\big]\\cos(\\omega_0 n) \\\\ \\omega_m = \\omega_0 / 6 \\end{gathered}`,
  ruido: `x[n] \\sim \\mathcal{U}[-1,\\,1]`,
};

/** Forma matemática de la señal de entrada x[n] (o x(t)) del laboratorio LTI. */
export function inputSignalFormula(type: InputSignalType, mode: LTIMode = 'discreto'): string {
  return mode === 'continuo' ? INPUT_FORMULAS_CONTINUOUS[type] : INPUT_FORMULAS[type];
}

/** Forma matemática de la respuesta al impulso h[n] (o h(t)) del sistema LTI. */
export function systemFormula(type: FilterType, mode: LTIMode = 'discreto'): string {
  return mode === 'continuo' ? SYSTEM_FORMULAS_CONTINUOUS[type] : SYSTEM_FORMULAS[type];
}

/** Forma matemática de la señal de prueba x[n] del módulo de análisis espectral. */
export function spectralSignalFormula(type: TestSignalType): string {
  return SPECTRAL_FORMULAS[type];
}
