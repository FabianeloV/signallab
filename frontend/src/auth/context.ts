import { createContext } from 'react';
import type { User } from 'firebase/auth';

export interface AuthContextValue {
  /** Usuario autenticado, o `null` si no hay sesión. */
  user: User | null;
  /** `true` mientras Firebase resuelve la sesión persistida al cargar. */
  loading: boolean;
  /** Inicia sesión con Google (popup). Lanza en caso de error. */
  signInWithGoogle: () => Promise<void>;
  /** Cierra la sesión actual. */
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
