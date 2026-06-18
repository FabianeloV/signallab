import styles from './StatusPill.module.css';

interface StatusPillProps {
  label: string;
  tone?: 'green' | 'blue';
}

/** Indicador de estado con punto de color (p. ej. "Motor Matemático Activo"). */
export function StatusPill({ label, tone = 'green' }: StatusPillProps) {
  return (
    <span className={styles.pill}>
      <span className={`${styles.dot} ${styles[tone]}`} aria-hidden="true" />
      {label}
    </span>
  );
}
