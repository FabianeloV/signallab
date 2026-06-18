# SignalLab — Motor de Convolución y Análisis Espectral

Laboratorio virtual e interactivo para **sistemas lineales invariantes en el tiempo (LTI)**. Permite diseñar señales discretas `x[n]`, aplicar sistemas (filtros) `h[n]`, y visualizar simultáneamente la **convolución en el dominio del tiempo** y su dual, la **multiplicación en el dominio de la frecuencia** mediante la Transformada de Fourier en Tiempo Discreto (DTFT).

![Stack](https://img.shields.io/badge/frontend-React%20%2B%20TypeScript%20%2B%20Vite-2f6bef) ![Backend](https://img.shields.io/badge/backend-FastAPI%20%2B%20NumPy%20%2B%20LaTeX-34b888)

---

## Arquitectura

El proyecto es un **monorepo** con dos piezas desplegables por separado:

```
signallab/
├── frontend/      # React + TypeScript + Vite (arquitectura atómica)  → GitHub Pages
├── backend/       # FastAPI + NumPy + Matplotlib + LaTeX               → Railway
└── .github/workflows/deploy-pages.yml   # CI/CD del frontend
```

### Decisión de diseño: ¿dónde se hace el cálculo?

Todo el **procesamiento de señales se ejecuta en el frontend en TypeScript** (convolución, DTFT, FFT radix-2, ventanas). Esto mantiene la aplicación **100 % funcional en GitHub Pages** sin depender de un servidor: las señales son pequeñas (N ≤ 256) y los algoritmos son directos.

El **backend de Python se reserva para lo que un navegador no hace bien** y que la especificación exige: **recomponer los cálculos con NumPy y compilar reportes LaTeX → PDF** con figuras de calidad tipográfica (Matplotlib). Esto respeta la separación "motor de cálculo / compilador de documentos" del diseño original (sustituyendo Julia por Python).

> Si el backend no está configurado, la app sigue funcionando: el cálculo y la **exportación de datos a JSON** son locales. Solo la descarga de reportes PDF requiere el backend.

---

## Frontend (`frontend/`)

### Stack
- **React 18 + TypeScript + Vite**
- **Arquitectura atómica**: `atoms/` → `molecules/` → `organisms/` → `templates/` → `pages/`
- **KaTeX** para notación matemática, **lucide-react** para iconografía, **CSS Modules** para estilos aislados
- **HashRouter** (`react-router-dom`) para enrutamiento robusto en GitHub Pages
- Gráficas en **SVG propio** (sin librerías pesadas): `StemPlot` y `SpectrumPlot`

### Desarrollo local
```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

### Compilación
```bash
npm run build        # type-check (tsc) + bundle (vite) → frontend/dist
npm run preview      # sirve el build localmente
```

### Variable de entorno
Copia `.env.example` a `.env` y define la URL del backend (opcional):
```
VITE_API_URL=https://tu-servicio.up.railway.app
```

### Despliegue en GitHub Pages (automático)
El workflow [`/.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) compila y publica en cada *push* a `main` que toque `frontend/`.

1. En el repositorio: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. (Opcional) Define el secreto `VITE_API_URL` en **Settings → Secrets and variables → Actions** para habilitar los reportes PDF.
3. Haz *push* a `main`. La acción publica `frontend/dist`.

> `vite.config.ts` usa `base: './'` (rutas relativas), por lo que **no necesitas configurar el nombre del repositorio**. Funciona tanto en `usuario.github.io/repo/` como en dominios propios.

---

## Backend (`backend/`)

### Stack
- **FastAPI** + **Uvicorn**
- **NumPy** (recálculo DSP), **Matplotlib** (figuras)
- **pdflatex** (TeX Live) para compilar los reportes; **respaldo automático en Matplotlib** si LaTeX no está disponible

### Endpoints
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET`  | `/health` | Estado del servicio y disponibilidad de LaTeX |
| `POST` | `/api/report/lti` | Genera el PDF del laboratorio LTI |
| `POST` | `/api/report/spectral` | Genera el PDF del análisis espectral |

El cuerpo de cada `POST` es exactamente el objeto de configuración que produce el frontend (mismos nombres de campo en camelCase).

### Desarrollo local
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload      # http://localhost:8000  (docs en /docs)
```
Sin TeX Live instalado, los reportes se generan con el motor de respaldo (Matplotlib) y siguen siendo PDFs válidos. Para la salida tipográfica completa, instala `pdflatex` (paquete `texlive-latex-recommended`).

### Despliegue en Railway
El servicio se construye con el [`backend/Dockerfile`](backend/Dockerfile) (incluye TeX Live para `pdflatex`).

1. Crea un proyecto en Railway y conéctalo a este repositorio.
2. En el servicio, establece **Settings → Root Directory = `backend`** (monorepo).
3. Railway detecta el `Dockerfile` y `railway.toml` automáticamente; el *healthcheck* apunta a `/health`.
4. (Recomendado) Define la variable de entorno `ALLOWED_ORIGINS` con el origen del frontend, p. ej.:
   ```
   ALLOWED_ORIGINS=https://usuario.github.io
   ```
5. Copia la URL pública del servicio y úsala como `VITE_API_URL` en el frontend.

---

## Cómo encajan las piezas

```
   Navegador (GitHub Pages)                         Railway
 ┌────────────────────────────┐      POST       ┌────────────────────────────┐
 │  React + TS                │  config JSON    │  FastAPI                   │
 │  • Cálculo DSP (TS)        │ ───────────────▶│  • Recálculo NumPy         │
 │  • Gráficas SVG            │                 │  • Figuras Matplotlib      │
 │  • Exportación JSON        │◀─────────────── │  • LaTeX → PDF (pdflatex)  │
 └────────────────────────────┘     PDF         └────────────────────────────┘
```

---

## Funcionalidades

- **Laboratorio LTI**: configuración de `x[n]` (exponencial, escalón, impulso, senoide, rampa) y `h[n]` (promediador FIR, diferenciador, IIR, paso-todo); convolución en tiempo y verificación del teorema de convolución en frecuencia, todo reactivo a los deslizadores.
- **Análisis Espectral**: muestreo de señales analógicas, ventanas (Hamming/Hanning/Blackman/rectangular), zero-padding y espectros de magnitud (lineal/dB) y fase.
- **Reportes y Teoremas**: compendio navegable de teoremas con notación matemática.
- **Experimentos Guardados**: galería de análisis previos con búsqueda y filtros.
- **Configuración**: estado del entorno y parámetros del motor.
- **Reportes PDF**: documentos LaTeX con parámetros, ecuaciones y figuras.

## Referencia teórica
Oppenheim & Willsky, *Señales y Sistemas*; convención de la DTFT y el teorema de convolución.

## Licencia
MIT.
