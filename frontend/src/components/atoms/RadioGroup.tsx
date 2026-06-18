import styles from './RadioGroup.module.css';

export interface RadioOption<T extends string> {
  value: T;
  label: string;
}

interface RadioGroupProps<T extends string> {
  name: string;
  value: T;
  options: RadioOption<T>[];
  onChange: (value: T) => void;
}

export function RadioGroup<T extends string>({
  name,
  value,
  options,
  onChange,
}: RadioGroupProps<T>) {
  return (
    <div className={styles.group} role="radiogroup">
      {options.map((opt) => {
        const checked = opt.value === value;
        return (
          <label
            key={opt.value}
            className={`${styles.option} ${checked ? styles.checked : ''}`}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={checked}
              onChange={() => onChange(opt.value)}
              className={styles.input}
            />
            <span className={styles.dot} aria-hidden="true" />
            <span className={styles.label}>{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}
