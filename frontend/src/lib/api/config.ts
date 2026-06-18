/**
 * Configuración del cliente de API.
 *
 * La URL base del backend se inyecta en tiempo de compilación mediante la
 * variable de entorno `VITE_API_URL` (ver `.env.example`). Si no se define, se
 * asume que no hay backend disponible y las funciones que lo requieran lo
 * indicarán explícitamente.
 */
export const API_BASE_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';

export const HAS_BACKEND = API_BASE_URL.length > 0;
