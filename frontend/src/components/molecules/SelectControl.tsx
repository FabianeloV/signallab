import type { ReactNode } from 'react';
import { Select } from '../atoms/Select';
import type { SelectOption } from '../atoms/Select';
import styles from './Field.module.css';

interface SelectControlProps<T extends string> {
  label: ReactNode;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
}

export function SelectControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: SelectControlProps<T>) {
  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <Select value={value} options={options} onChange={onChange} />
    </div>
  );
}
