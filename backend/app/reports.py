"""Orquestación de reportes: genera figuras, compone el documento LaTeX y lo
compila a PDF (con respaldo Matplotlib)."""

from __future__ import annotations

import tempfile
from pathlib import Path

from . import dsp, figures
from .latex import compile_latex, escape_latex, matplotlib_pdf_fallback
from .models import LTIReportRequest, SpectralReportRequest

# Etiquetas legibles para los tipos.
INPUT_LABELS = {
    "exponencial-decreciente": "Exponencial decreciente $a^{n}u[n]$",
    "escalon": "Escalón unitario $u[n]$",
    "impulso": "Impulso unitario $\\delta[n]$",
    "senoide": "Senoide discreta",
    "rampa": "Rampa",
}
FILTER_LABELS = {
    "promediador-fir": "Promediador móvil (FIR)",
    "diferenciador": "Diferenciador",
    "iir-primer-orden": "IIR de primer orden",
    "paso-todo": "Paso-todo (retraso puro)",
}
SIGNAL_LABELS = {
    "senoide": "Senoide discreta",
    "suma-senoides": "Suma de senoides",
    "chirp": "Chirp (barrido de frecuencia)",
    "cuadrada": "Onda cuadrada",
}
WINDOW_LABELS = {
    "rectangular": "Rectangular",
    "hamming": "Hamming",
    "hanning": "Hanning",
    "blackman": "Blackman",
}

_PREAMBLE = r"""\documentclass[11pt]{article}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\IfFileExists{lmodern.sty}{\usepackage{lmodern}}{}
\usepackage[a4paper,margin=2.2cm]{geometry}
\usepackage{amsmath}
\usepackage{graphicx}
\usepackage{xcolor}
\usepackage{booktabs}
\usepackage{parskip}
\definecolor{accent}{HTML}{2F6BEF}
\definecolor{muted}{HTML}{5B6470}
\setlength{\parindent}{0pt}
\pagestyle{empty}
"""


def _title_block(title: str, subtitle: str) -> str:
    return (
        r"\begin{center}"
        r"{\LARGE\bfseries\color{accent} " + escape_latex(title) + r"}\\[2pt]"
        r"{\large\color{muted} " + escape_latex(subtitle) + r"}\\[4pt]"
        r"{\small\color{muted} Generado por SignalLab}"
        r"\end{center}\vspace{6pt}\hrule\vspace{12pt}"
    )


def _params_table(rows: list[tuple[str, str]]) -> str:
    # Las etiquetas y valores provienen de constantes internas y de campos
    # numéricos acotados (enums Literal validados por Pydantic), por lo que
    # contienen LaTeX intencional (p. ej. $N$) y no deben escaparse.
    body = " \\\\\n".join(
        f"\\textbf{{{label}}} & {value}" for label, value in rows
    )
    return (
        r"\begin{center}\begin{tabular}{@{}p{6cm}p{8.5cm}@{}}\toprule"
        + body
        + r" \\\bottomrule\end{tabular}\end{center}"
    )


# --------------------------------------------------------------------------- #
# Reporte LTI
# --------------------------------------------------------------------------- #
def build_lti_report(req: LTIReportRequest) -> tuple[bytes, str]:
    x = dsp.make_input_signal(req)
    h = dsp.make_system(req)
    y = dsp.convolve(x, h)
    X = dsp.dtft(x)
    H = dsp.dtft(h)
    Y = dsp.dtft(y)

    with tempfile.TemporaryDirectory() as tmp:
        workdir = Path(tmp)
        time_png = workdir / "tiempo.png"
        freq_png = workdir / "frecuencia.png"
        figures.lti_time_figure(x, h, y, str(time_png))
        figures.lti_freq_figure(X, H, Y, str(freq_png))

        param_value = (
            f"$a = {req.input_param:.2f}$"
            if req.input_type == "exponencial-decreciente"
            else (
                f"$f = {req.input_param:.2f}$"
                if req.input_type == "senoide"
                else "—"
            )
        )
        rows = [
            ("Señal de entrada", INPUT_LABELS[req.input_type]),
            ("Parámetro", param_value),
            ("Longitud $N$", f"${req.length}$ muestras"),
            ("Sistema (filtro)", FILTER_LABELS[req.filter_type]),
            ("Orden $M$", f"${req.order}$"),
            ("Retraso $n_d$", f"${req.delay}$"),
        ]

        tex = (
            _PREAMBLE
            + r"\begin{document}"
            + _title_block(
                "Reporte de Análisis LTI",
                "Convolución Discreta y Transformada de Fourier (DTFT)",
            )
            + r"\section*{1. Configuración del experimento}"
            + _params_table(rows)
            + r"\section*{2. Modelo matemático}"
            + r"La salida del sistema lineal e invariante en el tiempo se obtiene "
            r"mediante la convolución discreta de la entrada con la respuesta al "
            r"impulso:"
            + r"\begin{equation*} y[n] = x[n] * h[n] = \sum_{k=-\infty}^{\infty} "
            r"x[k]\,h[n-k]. \end{equation*}"
            + r"Por el \textbf{teorema de convolución}, en el dominio de la "
            r"frecuencia esta operación equivale a un producto:"
            + r"\begin{equation*} Y(\Omega) = X(\Omega)\,H(\Omega), \qquad "
            r"X(\Omega) = \sum_{n} x[n]\,e^{-j\Omega n}. \end{equation*}"
            + r"\section*{3. Dominio del tiempo}"
            + r"\begin{center}\includegraphics[width=\textwidth]{tiempo.png}\end{center}"
            + r"\section*{4. Dominio de la frecuencia}"
            + r"Se comprueba que la magnitud del espectro de salida coincide con el "
            r"producto de las magnitudes de los espectros de entrada y del sistema, "
            r"verificando el teorema de convolución."
            + r"\begin{center}\includegraphics[width=\textwidth]{frecuencia.png}\end{center}"
            + r"\end{document}"
        )

        pdf = compile_latex(tex, workdir)
        if pdf is not None:
            return pdf, "latex"

        fallback = matplotlib_pdf_fallback(
            [time_png, freq_png],
            "Reporte de Análisis LTI",
            "Convolución Discreta y DTFT",
            [(label, _strip_math(value)) for label, value in rows],
        )
        return fallback, "matplotlib"


# --------------------------------------------------------------------------- #
# Reporte espectral
# --------------------------------------------------------------------------- #
def build_spectral_report(req: SpectralReportRequest) -> tuple[bytes, str]:
    result = dsp.analyze_spectrum(req)

    with tempfile.TemporaryDirectory() as tmp:
        workdir = Path(tmp)
        time_png = workdir / "senal.png"
        spectra_png = workdir / "espectros.png"
        figures.spectral_time_figure(result, str(time_png))
        figures.spectral_spectra_figure(result, req.scale, str(spectra_png))

        rows = [
            ("Tipo de señal", SIGNAL_LABELS[req.signal_type]),
            ("Frecuencia analógica $f_0$", f"${req.analog_freq:.0f}$ Hz"),
            ("Frecuencia de muestreo $F_s$", f"${req.sampling_freq:.0f}$ Hz"),
            ("Frecuencia normalizada", f"$\\Omega_0 = {result.normalized_freq:.3f}$ rad"),
            ("Número de muestras $N$", f"${req.num_samples}$"),
            ("Ventana", WINDOW_LABELS[req.window]),
            ("Puntos FFT", f"${req.fft_points}$ (zero-padding)"),
            ("Escala de magnitud", "Logarítmica (dB)" if req.scale == "logaritmica" else "Lineal"),
        ]

        tex = (
            _PREAMBLE
            + r"\begin{document}"
            + _title_block(
                "Reporte de Análisis Espectral",
                "Transformada de Fourier en Tiempo Discreto (DTFT)",
            )
            + r"\section*{1. Configuración del análisis}"
            + _params_table(rows)
            + r"\section*{2. Fundamento}"
            + r"La DTFT descompone la señal en sus componentes frecuenciales:"
            + r"\begin{equation*} X(\Omega) = \sum_{n} x[n]\,e^{-j\Omega n}. \end{equation*}"
            + r"La frecuencia analógica $f_0$ se relaciona con la frecuencia "
            r"normalizada mediante $\Omega_0 = 2\pi f_0 / F_s$. El espectro se "
            r"estima con una FFT sobre la señal enventanada y rellenada con ceros."
            + r"\section*{3. Señal en el tiempo}"
            + r"\begin{center}\includegraphics[width=\textwidth]{senal.png}\end{center}"
            + r"\section*{4. Espectros de magnitud y fase}"
            + r"\begin{center}\includegraphics[width=\textwidth]{espectros.png}\end{center}"
            + r"\end{document}"
        )

        pdf = compile_latex(tex, workdir)
        if pdf is not None:
            return pdf, "latex"

        fallback = matplotlib_pdf_fallback(
            [time_png, spectra_png],
            "Reporte de Análisis Espectral",
            "Transformada de Fourier en Tiempo Discreto (DTFT)",
            [(label, _strip_math(value)) for label, value in rows],
        )
        return fallback, "matplotlib"


def _strip_math(value: str) -> str:
    """Limpia marcas LaTeX simples para la portada del PDF de respaldo."""
    return (
        value.replace("$", "")
        .replace("\\delta", "δ")
        .replace("\\Omega", "Ω")
        .replace("\\pi", "π")
        .replace("^{n}", "ⁿ")
        .replace("u[n]", "u[n]")
        .strip()
    )
