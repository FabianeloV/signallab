"""Compilación de documentos LaTeX a PDF.

La ruta principal compila con `pdflatex` (instalado en la imagen Docker). Si el
motor LaTeX no está disponible (por ejemplo en un entorno de desarrollo local
sin TeX), se recurre a un PDF de respaldo ensamblado con Matplotlib, de modo
que el endpoint siempre devuelve un documento válido."""

from __future__ import annotations

import shutil
import subprocess
from pathlib import Path

# Caracteres especiales de LaTeX y su escape.
_LATEX_SPECIALS = {
    "&": r"\&",
    "%": r"\%",
    "$": r"\$",
    "#": r"\#",
    "_": r"\_",
    "{": r"\{",
    "}": r"\}",
    "~": r"\textasciitilde{}",
    "^": r"\textasciicircum{}",
    "\\": r"\textbackslash{}",
}


def escape_latex(text: str) -> str:
    """Escapa texto plano para insertarlo de forma segura en LaTeX."""
    return "".join(_LATEX_SPECIALS.get(ch, ch) for ch in str(text))


def pdflatex_available() -> bool:
    return shutil.which("pdflatex") is not None


def compile_latex(tex_source: str, workdir: Path) -> bytes | None:
    """Escribe y compila `documento.tex` en `workdir`. Devuelve los bytes del
    PDF o None si la compilación falla."""
    if not pdflatex_available():
        return None

    tex_path = workdir / "documento.tex"
    tex_path.write_text(tex_source, encoding="utf-8")

    try:
        # Una sola pasada basta (sin referencias cruzadas ni TOC).
        subprocess.run(
            [
                "pdflatex",
                "-interaction=nonstopmode",
                "-halt-on-error",
                "documento.tex",
            ],
            cwd=workdir,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            timeout=60,
            check=False,
        )
    except (subprocess.TimeoutExpired, OSError):
        return None

    pdf_path = workdir / "documento.pdf"
    if pdf_path.exists():
        return pdf_path.read_bytes()
    return None


def matplotlib_pdf_fallback(
    figure_paths: list[Path],
    title: str,
    subtitle: str,
    rows: list[tuple[str, str]],
) -> bytes:
    """Ensambla un PDF de respaldo con una portada de parámetros y las figuras,
    usando Matplotlib (sin dependencia de LaTeX)."""
    import io

    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.image as mpimg
    import matplotlib.pyplot as plt
    from matplotlib.backends.backend_pdf import PdfPages

    buffer = io.BytesIO()
    with PdfPages(buffer) as pdf:
        # Portada con parámetros.
        fig = plt.figure(figsize=(8.27, 11.69))  # A4
        fig.text(0.08, 0.93, title, fontsize=18, fontweight="bold")
        fig.text(0.08, 0.90, subtitle, fontsize=11, color="#5b6470")
        y = 0.83
        for label, value in rows:
            fig.text(0.08, y, label, fontsize=10, color="#5b6470")
            fig.text(0.5, y, value, fontsize=10, fontweight="medium", color="#1a1d23")
            y -= 0.035
        fig.text(
            0.08,
            0.05,
            "Generado por SignalLab — motor de respaldo (sin LaTeX).",
            fontsize=8,
            color="#98a1ad",
        )
        plt.axis("off")
        pdf.savefig(fig)
        plt.close(fig)

        # Una página por figura.
        for fig_path in figure_paths:
            img = mpimg.imread(str(fig_path))
            h, w = img.shape[0], img.shape[1]
            page = plt.figure(figsize=(11.69, 11.69 * h / w / 1.0))
            ax = page.add_axes([0.03, 0.03, 0.94, 0.94])
            ax.imshow(img)
            ax.axis("off")
            pdf.savefig(page)
            plt.close(page)

    return buffer.getvalue()
