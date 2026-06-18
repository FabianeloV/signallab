import styles from './Slider.module.css';

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  /** Atenúa la pista cuando el control no aporta efecto (p. ej. filtro sin retraso). */
  muted?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
}

export function Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
  muted = false,
  disabled = false,
  ariaLabel,
}: SliderProps) {
  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100;

  const classes = [
    styles.slider,
    styles.filled,
    muted ? styles.muted : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.wrapper}>
      <input
        type="range"
        className={classes}
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        aria-label={ariaLabel}
        style={{ ['--pct' as string]: `${pct}%` }}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
