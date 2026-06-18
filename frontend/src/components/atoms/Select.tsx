import { ChevronDown } from 'lucide-react';
import styles from './Select.module.css';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}

interface SelectProps<T extends string = string> {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  ariaLabel?: string;
}

export function Select<T extends string = string>({
  value,
  options,
  onChange,
  ariaLabel,
}: SelectProps<T>) {
  return (
    <div className={styles.wrapper}>
      <select
        className={styles.select}
        value={value}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span className={styles.chevron}>
        <ChevronDown size={16} />
      </span>
    </div>
  );
}
