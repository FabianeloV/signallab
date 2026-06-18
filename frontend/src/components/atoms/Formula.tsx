import { useMemo } from 'react';
import katex from 'katex';

interface MathProps {
  /** Cadena LaTeX a renderizar, p. ej. "y[n] = x[n] * h[n]". */
  expression: string;
  /** Modo display (centrado, tamaño mayor) o en línea. */
  display?: boolean;
  className?: string;
}

/**
 * Renderiza notación matemática con KaTeX. Encapsula el renderizado para que
 * el resto de la aplicación trabaje únicamente con cadenas LaTeX.
 */
export function Formula({ expression, display = false, className }: MathProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(expression, {
        displayMode: display,
        throwOnError: false,
        output: 'htmlAndMathml',
      });
    } catch {
      return expression;
    }
  }, [expression, display]);

  return (
    <span
      className={className}
      // KaTeX produce HTML confiable a partir de cadenas controladas por la app.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
