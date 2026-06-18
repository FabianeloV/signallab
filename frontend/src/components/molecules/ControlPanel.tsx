import type { ReactNode } from 'react';
import { Card } from '../atoms/Card';
import styles from './ControlPanel.module.css';

interface ControlPanelProps {
  title: ReactNode;
  children: ReactNode;
}

/**
 * Panel lateral con título de sección (p. ej. "Señal de Entrada x[n]") que
 * agrupa controles de formulario. Es la base de los paneles de configuración.
 */
export function ControlPanel({ title, children }: ControlPanelProps) {
  return (
    <Card className={styles.panel}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.content}>{children}</div>
    </Card>
  );
}
