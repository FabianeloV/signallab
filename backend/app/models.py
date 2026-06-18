"""Modelos de solicitud (Pydantic) que reflejan exactamente los objetos de
configuración enviados por el frontend. Se usan alias en camelCase para
aceptar el JSON tal cual lo emite la aplicación web, manteniendo nombres
snake_case en Python."""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

InputSignalType = Literal[
    "exponencial-decreciente",
    "escalon",
    "impulso",
    "senoide",
    "rampa",
]

FilterType = Literal[
    "promediador-fir",
    "diferenciador",
    "iir-primer-orden",
    "paso-todo",
]

TestSignalType = Literal["senoide", "suma-senoides", "chirp", "cuadrada"]
WindowType = Literal["rectangular", "hamming", "hanning", "blackman"]
MagnitudeScale = Literal["lineal", "logaritmica"]


class _CamelModel(BaseModel):
    """Permite poblar los campos tanto por su alias camelCase como por nombre."""

    model_config = ConfigDict(populate_by_name=True)


class LTIReportRequest(_CamelModel):
    input_type: InputSignalType = Field(alias="inputType")
    input_param: float = Field(alias="inputParam", ge=0.0, le=10.0)
    length: int = Field(ge=1, le=512)
    filter_type: FilterType = Field(alias="filterType")
    order: int = Field(ge=1, le=64)
    delay: int = Field(ge=0, le=64)


class SpectralReportRequest(_CamelModel):
    signal_type: TestSignalType = Field(alias="signalType")
    analog_freq: float = Field(alias="analogFreq", gt=0)
    sampling_freq: float = Field(alias="samplingFreq", gt=0)
    num_samples: int = Field(alias="numSamples", ge=2, le=4096)
    window: WindowType
    fft_points: int = Field(alias="fftPoints", ge=2, le=8192)
    scale: MagnitudeScale
