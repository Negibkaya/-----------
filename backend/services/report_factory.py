from abc import ABC, abstractmethod
from services.reports import Report, TextReport, JSONReport


class ReportFactory(ABC):
    """Абстрактная фабрика отчетов."""

    @abstractmethod
    def create_report(self) -> Report:
        """Фабричный метод для создания отчета."""
        pass


class TextReportFactory(ReportFactory):
    """Фабрика текстовых отчетов."""

    def create_report(self) -> Report:
        return TextReport()


class JSONReportFactory(ReportFactory):
    """Фабрика JSON отчетов."""

    def create_report(self) -> Report:
        return JSONReport()
