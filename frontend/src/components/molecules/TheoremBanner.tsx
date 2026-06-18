import { Formula } from '../atoms/Formula';
import styles from './TheoremBanner.module.css';

interface TheoremBannerProps {
  tone: 'amber' | 'green';
  /** Texto en negrita al inicio (p. ej. "Teorema de Convolución:"). */
  lead: string;
  /** Resto del enunciado. */
  description: string;
  /** Fórmula LaTeX mostrada a la derecha. */
  formula: string;
}

export function TheoremBanner({
  tone,
  lead,
  description,
  formula,
}: TheoremBannerProps) {
  return (
    <div className={`${styles.banner} ${styles[tone]}`}>
      <p className={styles.text}>
        <strong>{lead}</strong> {description}
      </p>
      <div className={styles.formula}>
        <Formula expression={formula} />
      </div>
    </div>
  );
}
