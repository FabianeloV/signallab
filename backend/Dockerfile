# Imagen del backend de SignalLab.
# El contexto de construcción es el directorio `backend/` (configura la "Root
# Directory" del servicio en Railway como `backend`).
FROM python:3.12-slim

# TeX Live mínimo para compilar los reportes (pdflatex + paquetes usados:
# amsmath, graphicx, xcolor, booktabs, geometry, babel-spanish, lmodern).
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      texlive-latex-base \
      texlive-latex-recommended \
      texlive-fonts-recommended \
      texlive-lang-spanish \
      lmodern \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

ENV PORT=8000
EXPOSE 8000

# Railway inyecta $PORT en tiempo de ejecución.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
