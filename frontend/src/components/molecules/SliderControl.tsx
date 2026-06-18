import type { ReactNode } from 'react';
import { FieldLabel } from '../atoms/FieldLabel';
import { Slider } from '../atoms/Slider';
import styles from './Field.module.css';

interface SliderControlProps {
  label: ReactNode;
  value: number;
  min: number;
  max: number;
  step?: number;
  /** Texto del valor mostrado (permite formato propio, p. ej. "0.75"). */
  displayValue?: ReactNode;
  onChange: (value: number) => void;
  muted?: boolean;
}

export function SliderControl({
  label,
  value,
  min,
  max,
  step,
  displayValue,
  onChange,
  muted,
}: SliderControlProps) {
  return (
    <div className={styles.field}>
      <FieldLabel value={displayValue ?? value}>{label}</FieldLabel>
      <Slider
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={onChange}
        muted={muted}
      />
    </div>
  );
}
