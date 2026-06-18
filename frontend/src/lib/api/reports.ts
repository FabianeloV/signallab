import type { LTIConfig } from '../../hooks/useLTISystem';
import type { SpectralConfig } from '../dsp/spectral';
import { API_BASE_URL, HAS_BACKEND } from './config';

export interface ReportResponse {
  ok: boolean;
  /** Mensaje legible para mostrar al usuario. */
  message: string;
}

/**
 * Solicita al backend la generación de un reporte LaTeX → PDF del laboratorio
 * LTI y dispara la descarga del archivo resultante en el navegador.
 */
export async function generateLTIReport(
  config: LTIConfig,
): Promise<ReportResponse> {
  return requestReport('/api/report/lti', config, 'reporte-lti-signallab.pdf');
}

/** Genera el reporte del módulo de análisis espectral. */
export async function generateSpectralReport(
  config: SpectralConfig,
): Promise<ReportResponse> {
  return requestReport(
    '/api/report/spectral',
    config,
    'reporte-espectral-signallab.pdf',
  );
}

async function requestReport(
  path: string,
  payload: unknown,
  filename: string,
): Promise<ReportResponse> {
  if (!HAS_BACKEND) {
    return {
      ok: false,
      message:
        'No hay backend configurado. Define VITE_API_URL apuntando al servicio de Railway para habilitar reportes PDF.',
    };
  }

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const detail = await safeReadError(res);
      return {
        ok: false,
        message: `El servidor respondió ${res.status}. ${detail}`,
      };
    }

    const blob = await res.blob();
    triggerDownload(blob, filename);
    return { ok: true, message: 'Reporte generado y descargado correctamente.' };
  } catch (err) {
    return {
      ok: false,
      message:
        'No se pudo contactar al backend de reportes. Verifica que el servicio en Railway esté activo.',
    };
  }
}

async function safeReadError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return typeof data?.detail === 'string' ? data.detail : '';
  } catch {
    return '';
  }
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
