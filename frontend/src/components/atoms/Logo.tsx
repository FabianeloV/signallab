import styles from './Logo.module.css';

interface LogoProps {
  /** Oculta el texto y muestra solo el isotipo. */
  iconOnly?: boolean;
}

/**
 * Isotipo de SignalLab: un glifo de onda discreta dentro de un cuadrado azul
 * redondeado, acompañado del logotipo.
 */
export function Logo({ iconOnly = false }: LogoProps) {
  return (
    <div className={styles.logo}>
      <div className={styles.mark} aria-hidden="true">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
          <path
            d="M2 12h3l2.2-6 3.4 12 3.2-9 2 5h4"
            stroke="#fff"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {!iconOnly && <span className={styles.wordmark}>SignalLab</span>}
    </div>
  );
}
