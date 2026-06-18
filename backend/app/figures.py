"""Generación de figuras (Matplotlib) para los reportes.

Usa el backend 'Agg' (sin pantalla) y un estilo coherente con la aplicación:
azul para la entrada, verde para el sistema y púrpura para la salida."""

from __future__ import annotations

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402

from .dsp import Signal, Spectrum, SpectralResult  # noqa: E402

BLUE = "#2f6bef"
GREEN = "#34b888"
PURPLE = "#8b5cf6"
GRID = "#e8eaee"
TEXT = "#1a1d23"

plt.rcParams.update(
    {
        "font.size": 9,
        "axes.edgecolor": "#d9dce1",
        "axes.labelcolor": TEXT,
        "axes.titlesize": 10,
        "axes.titleweight": "bold",
        "xtick.color": "#5b6470",
        "ytick.color": "#5b6470",
        "figure.facecolor": "white",
        "axes.facecolor": "white",
        "savefig.dpi": 150,
        "savefig.bbox": "tight",
    }
)

PI_TICKS = ([-np.pi, 0, np.pi], ["$-\\pi$", "0", "$\\pi$"])


def _stem(ax, n, samples, color):
    markerline, stemlines, baseline = ax.stem(n, samples, basefmt=" ")
    plt.setp(stemlines, color=color, linewidth=1.2)
    plt.setp(markerline, color=color, markersize=3.5)
    ax.axhline(0, color=GRID, linewidth=1, zorder=0)
    ax.grid(True, color=GRID, linewidth=0.6, alpha=0.7)
    ax.set_axisbelow(True)


def _spectrum(ax, omega, values, color, fill=True, baseline=None):
    ax.plot(omega, values, color=color, linewidth=1.8)
    if fill:
        base = baseline if baseline is not None else float(np.min(values))
        ax.fill_between(omega, values, base, color=color, alpha=0.15)
    ax.axvline(0, color=TEXT, linestyle=(0, (2, 3)), linewidth=1.3, alpha=0.8)
    ax.grid(True, color=GRID, linewidth=0.6, alpha=0.7)
    ax.set_axisbelow(True)
    ax.set_xticks(PI_TICKS[0])
    ax.set_xticklabels(PI_TICKS[1])
    ax.set_xlim(omega[0], omega[-1])


def lti_time_figure(x: Signal, h: Signal, y: Signal, path: str) -> None:
    fig, axes = plt.subplots(1, 3, figsize=(11, 2.8))
    _stem(axes[0], np.arange(x.n0, x.n0 + x.samples.size), x.samples, BLUE)
    axes[0].set_title("Entrada $x[n]$")
    _stem(axes[1], np.arange(h.n0, h.n0 + h.samples.size), h.samples, GREEN)
    axes[1].set_title("Sistema $h[n]$")
    _stem(axes[2], np.arange(y.n0, y.n0 + y.samples.size), y.samples, PURPLE)
    axes[2].set_title("Salida $y[n] = x[n] * h[n]$")
    fig.tight_layout()
    fig.savefig(path)
    plt.close(fig)


def lti_freq_figure(X: Spectrum, H: Spectrum, Y: Spectrum, path: str) -> None:
    fig, axes = plt.subplots(1, 3, figsize=(11, 2.8))
    _spectrum(axes[0], X.omega, X.magnitude, BLUE, baseline=0)
    axes[0].set_title("$|X(\\Omega)|$")
    _spectrum(axes[1], H.omega, H.magnitude, GREEN, baseline=0)
    axes[1].set_title("$|H(\\Omega)|$")
    _spectrum(axes[2], Y.omega, Y.magnitude, PURPLE, baseline=0)
    axes[2].set_title("$|Y(\\Omega)| = |X(\\Omega)||H(\\Omega)|$")
    fig.tight_layout()
    fig.savefig(path)
    plt.close(fig)


def spectral_time_figure(result: SpectralResult, path: str) -> None:
    fig, ax = plt.subplots(figsize=(11, 2.6))
    n = np.arange(result.time_signal.size)
    _stem(ax, n, result.time_signal, BLUE)
    ax.set_title("Señal en el Dominio del Tiempo $x[n]$")
    ax.set_xlabel("n")
    fig.tight_layout()
    fig.savefig(path)
    plt.close(fig)


def spectral_spectra_figure(result: SpectralResult, scale: str, path: str) -> None:
    fig, axes = plt.subplots(1, 2, figsize=(11, 3.0))
    _spectrum(
        axes[0],
        result.omega,
        result.magnitude,
        GREEN,
        baseline=(-80 if scale == "logaritmica" else 0),
    )
    axes[0].set_title("Espectro de Magnitud $|X(\\Omega)|$")
    axes[0].set_ylabel("dB" if scale == "logaritmica" else "Magnitud")

    _spectrum(axes[1], result.omega, result.phase, PURPLE, fill=False)
    axes[1].set_title("Espectro de Fase $\\angle X(\\Omega)$")
    axes[1].set_ylabel("Radianes")
    axes[1].set_ylim(-np.pi, np.pi)
    fig.tight_layout()
    fig.savefig(path)
    plt.close(fig)
