import type { ReactNode } from 'react';
import styles from './FieldLabel.module.css';

interface FieldLabelProps {
  children: ReactNode;
  /** Valor mostrado a la derecha de la etiqueta (p. ej. el valor de un deslizador). */
  value?: ReactNode;
}

export function FieldLabel({ children, value }: FieldLabelProps) {
  return (
    <div className={styles.row}>
      <span className={styles.label}>{children}</span>
      {value !== undefined && <span className={styles.value}>{value}</span>}
    </div>
  );
}
