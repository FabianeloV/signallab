import { useState } from 'react';
import { FirebaseError } from 'firebase/app';
import { Button } from '../atoms/Button';
import DotField from '../atoms/DotField';
import { useAuth } from '../../auth';
import styles from './Login.module.css';

/** Logotipo "G" de Google con sus colores de marca. */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
      />
    </svg>
  );
}

/** Traduce el código de error de Firebase a un mensaje en español. */
function mapAuthError(error: unknown): string | null {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/cancelled-popup-request':
        // Duplicado benigno (se abrió otra ventana); no mostramos nada.
        return null;
      case 'auth/popup-closed-by-user':
        return 'Cerraste la ventana antes de completar el inicio de sesión.';
      case 'auth/popup-blocked':
        return 'Tu navegador bloqueó la ventana emergente. Habilítala e inténtalo de nuevo.';
      case 'auth/unauthorized-domain':
        return 'Este dominio no está autorizado en Firebase.';
      case 'auth/network-request-failed':
        return 'Error de red. Revisa tu conexión e inténtalo de nuevo.';
    }
  }
  return 'No se pudo iniciar sesión. Inténtalo de nuevo.';
}

/**
 * Pantalla de inicio de sesión (solo Google OAuth). Es lo primero que se
 * muestra cuando no hay sesión activa.
 */
export function Login() {
  const { signInWithGoogle } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogle() {
    setSubmitting(true);
    setError(null);
    try {
      await signInWithGoogle();
      // En caso de éxito, el gate cambia solo vía onAuthStateChanged.
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <aside className={styles.brandPanel}>
        <div className={styles.dots} aria-hidden="true">
          <DotField
            dotRadius={1.5}
            dotSpacing={14}
            bulgeStrength={67}
            glowRadius={160}
            sparkle={false}
            waveAmplitude={0}
            cursorRadius={500}
            cursorForce={0.1}
            bulgeOnly
            gradientFrom="#A855F7"
            gradientTo="#B497CF"
            glowColor="#120F17"
          />
        </div>
        <div className={styles.brandInner}>
          <h1 className={styles.title}>
            <span className={styles.titleSigna}>Signa</span>
            <span className={styles.titleLab}>Lab</span>
          </h1>
          <p className={styles.tagline}>
            Laboratorio de Señales y Sistemas LTI
          </p>
        </div>
      </aside>

      <main className={styles.formPanel}>
        <div className={styles.formInner}>
          <h2 className={styles.heading}>Inicia sesión para continuar</h2>
          <p className={styles.subheading}>
            Accede con tu cuenta de Google para entrar al laboratorio.
          </p>

          <Button
            variant="secondary"
            fullWidth
            icon={<GoogleIcon />}
            onClick={handleGoogle}
            disabled={submitting}
          >
            {submitting ? 'Conectando…' : 'Continuar con Google'}
          </Button>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
