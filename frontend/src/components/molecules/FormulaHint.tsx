import { Formula } from '../atoms/Formula';
import styles from './FormulaHint.module.css';

interface FormulaHintProps {
  /** Expresión LaTeX a mostrar (forma matemática de la opción seleccionada). */
  expression: string;
  /** Etiqueta corta de la opción (p. ej. "Escalón Unitario"). */
  caption?: string;
}

/**
 * Recuadro discreto que muestra la forma matemática de la opción elegida en un
 * panel de control, para que el usuario asocie el nombre con su expresión.
 */
export function FormulaHint({ expression, caption }: FormulaHintProps) {
  return (
    <div className={styles.hint}>
      {caption && <span className={styles.caption}>{caption}</span>}
      <Formula expression={expression} display className={styles.formula} />
    </div>
  );
}
