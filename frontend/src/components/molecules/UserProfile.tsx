import { useState } from 'react';
import styles from './UserProfile.module.css';

interface UserProfileProps {
  name: string;
  role: string;
  /** Foto de perfil (p.ej. de Google). Si falta o falla, se muestran iniciales. */
  photoURL?: string | null;
}

export function UserProfile({ name, role, photoURL }: UserProfileProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const initials = name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const showImage = Boolean(photoURL) && !imgFailed;

  return (
    <div className={styles.profile}>
      {showImage ? (
        <img
          className={styles.avatar}
          src={photoURL ?? undefined}
          alt=""
          // Las URLs de Google (lh3.googleusercontent.com) a veces dan 403 si se
          // envía referrer; sin referrer cargan de forma fiable.
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div className={styles.avatar} aria-hidden="true">
          {initials}
        </div>
      )}
      <div className={styles.meta}>
        <span className={styles.name}>{name}</span>
        <span className={styles.role}>{role}</span>
      </div>
    </div>
  );
}
