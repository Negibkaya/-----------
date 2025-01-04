from abc import ABC, abstractmethod
from typing import Dict, Any
import json


class Report(ABC):
    """Абстрактный класс отчета."""

    @abstractmethod
    def generate(self, data: Dict[str, Any]) -> str:
        """Генерирует отчет на основе данных."""
        pass


class TextReport(Report):
    """Текстовый отчет."""

    def generate(self, data: Dict[str, Any]) -> str:
        report_str = ""
        for key, value in data.items():
            report_str += f"{key}: {value}\n"
        return report_str


class JSONReport(Report):
    """JSON отчет."""

    def generate(self, data: Dict[str, Any]) -> str:
        return json.dumps(data, indent=4, ensure_ascii=False)
