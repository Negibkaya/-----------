from sqlalchemy.orm import Session
from . import service_analytics
from .report_factory import ReportFactory


class AnalyticsFacade:
    def __init__(self, db: Session, report_factory: ReportFactory = None):
        self.db = db
        self.report_factory = report_factory

    def get_all_analytics_data(self):
        """Получить всю аналитику, используя сервисные функции."""
        total_expenses = service_analytics.get_total_expenses(self.db)
        expenses_by_employee = service_analytics.get_expenses_by_employee(
            self.db)
        expenses_by_expense_type = service_analytics.get_expenses_by_expense_type(
            self.db)
        employees_with_most_trips = service_analytics.get_employees_with_most_trips(
            self.db)
        most_popular_destinations = service_analytics.get_most_popular_destinations(
            self.db)
        average_expense_per_trip = service_analytics.get_average_expense_per_trip(
            self.db)

        average_expense_per_trip = f"{average_expense_per_trip:.2f}"

        return {
            "total_expenses": total_expenses,
            "expenses_by_employee": [{"employee": fio, "total_expenses": expenses} for fio, expenses in expenses_by_employee],
            "expenses_by_expense_type": [{"expense_type": name, "total_expenses": expenses} for name, expenses in expenses_by_expense_type],
            "employees_with_most_trips": [{"employee": fio, "trip_count": count} for fio, count in employees_with_most_trips],
            "most_popular_destinations": [{"destination": destination, "trip_count": count} for destination, count in most_popular_destinations],
            "average_expense_per_trip": average_expense_per_trip,
        }

    def generate_report(self, data_type: str):
        """Генерирует отчет указанного типа на основе аналитических данных."""
        if self.report_factory is None:
            raise ValueError("Report factory is not set")

        analytics_data = self.get_all_analytics_data()
        report_data = {}

        if data_type == "total_expenses":
            report_data = {"total_expenses": analytics_data["total_expenses"]}
        elif data_type == "expenses_by_employee":
            report_data = {
                "expenses_by_employee": analytics_data["expenses_by_employee"]}
        elif data_type == "expenses_by_expense_type":
            report_data = {
                "expenses_by_expense_type": analytics_data["expenses_by_expense_type"]}
        elif data_type == "employees_with_most_trips":
            report_data = {
                "employees_with_most_trips": analytics_data["employees_with_most_trips"]}
        elif data_type == "most_popular_destinations":
            report_data = {
                "most_popular_destinations": analytics_data["most_popular_destinations"]}
        elif data_type == "average_expense_per_trip":
            report_data = {
                "average_expense_per_trip": analytics_data["average_expense_per_trip"]}
        elif data_type == "all":
            report_data = analytics_data
        else:
            raise ValueError(f"Invalid data type: {data_type}")

        report = self.report_factory.create_report()
        return report.generate(report_data)
