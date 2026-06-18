"""Aplicación FastAPI de SignalLab.

Expone endpoints para generar reportes PDF (LaTeX) del laboratorio LTI y del
análisis espectral. El cálculo numérico se realiza con NumPy y las figuras con
Matplotlib; la compilación tipográfica usa pdflatex con respaldo Matplotlib."""

from __future__ import annotations

import os

from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware

from . import __version__
from .latex import pdflatex_available
from .models import LTIReportRequest, SpectralReportRequest
from .reports import build_lti_report, build_spectral_report

app = FastAPI(
    title="SignalLab Backend",
    version=__version__,
    description="Cálculo DSP y generación de reportes LaTeX para SignalLab.",
)

# Orígenes permitidos: configurables por variable de entorno (separados por
# comas). Por defecto se permite cualquiera para facilitar el despliegue.
_origins_env = os.getenv("ALLOWED_ORIGINS", "*").strip()
allow_origins = ["*"] if _origins_env == "*" else [
    o.strip() for o in _origins_env.split(",") if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


def _pdf_response(pdf: bytes, engine: str, filename: str) -> Response:
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "X-Report-Engine": engine,
        },
    )


@app.get("/")
def root() -> dict:
    return {
        "name": "SignalLab Backend",
        "version": __version__,
        "latex": pdflatex_available(),
        "endpoints": ["/health", "/api/report/lti", "/api/report/spectral"],
    }


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "latex": pdflatex_available()}


@app.post("/api/report/lti")
def report_lti(req: LTIReportRequest) -> Response:
    pdf, engine = build_lti_report(req)
    return _pdf_response(pdf, engine, "reporte-lti-signallab.pdf")


@app.post("/api/report/spectral")
def report_spectral(req: SpectralReportRequest) -> Response:
    pdf, engine = build_spectral_report(req)
    return _pdf_response(pdf, engine, "reporte-espectral-signallab.pdf")
