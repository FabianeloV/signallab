import styles from './UserProfile.module.css';

interface UserProfileProps {
  name: string;
  role: string;
}

export function UserProfile({ name, role }: UserProfileProps) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className={styles.profile}>
      <div className={styles.avatar} aria-hidden="true">
        {initials}
      </div>
      <div className={styles.meta}>
        <span className={styles.name}>{name}</span>
        <span className={styles.role}>{role}</span>
      </div>
    </div>
  );
}
