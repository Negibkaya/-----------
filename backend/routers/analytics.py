from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException
from database import get_db
from services import service_analytics, analytics_facade
from services.report_factory import TextReportFactory, JSONReportFactory

from typing import List, Dict, Any

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"],
)


@router.get("/total_expenses")
def read_total_expenses(db: Session = Depends(get_db)):
    """Получить общую сумму всех расходов."""
    return service_analytics.get_total_expenses(db)


@router.get("/expenses_by_employee")
def read_expenses_by_employee(db: Session = Depends(get_db)):
    """Получить общую сумму расходов для каждого сотрудника."""
    results = service_analytics.get_expenses_by_employee(db)
    return [{"employee": fio, "total_expenses": expenses} for fio, expenses in results]


@router.get("/expenses_by_expense_type")
def read_expenses_by_expense_type(db: Session = Depends(get_db)):
    """Получить общую сумму расходов по типам расходов."""
    results = service_analytics.get_expenses_by_expense_type(db)
    return [{"expense_type": name, "total_expenses": expenses} for name, expenses in results]


@router.get("/employees_with_most_trips")
def read_employees_with_most_trips(db: Session = Depends(get_db), limit: int = 5):
    """Получить список сотрудников с наибольшим количеством командировок."""
    results = service_analytics.get_employees_with_most_trips(db, limit)
    return [{"employee": fio, "trip_count": count} for fio, count in results]


@router.get("/most_popular_destinations")
def read_most_popular_destinations(db: Session = Depends(get_db), limit: int = 5):
    """Получить список самых популярных направлений командировок."""
    results = service_analytics.get_most_popular_destinations(db, limit)
    return [{"destination": destination, "trip_count": count} for destination, count in results]


@router.get("/average_expense_per_trip")
def read_average_expense_per_trip(db: Session = Depends(get_db)):
    """Получить среднюю сумму расходов на одну командировку."""
    return service_analytics.get_average_expense_per_trip(db)


@router.get("/all_analytics")
def read_all_analytics(db: Session = Depends(get_db)):
    """Получить всю аналитику."""
    facade = analytics_facade.AnalyticsFacade(db)
    return facade.get_all_analytics_data()


@router.get("/report/{report_type}/{data_type}")
def generate_report(report_type: str, data_type: str, db: Session = Depends(get_db)):
    """Генерирует отчет указанного типа."""
    if report_type == "text":
        report_factory = TextReportFactory()
    elif report_type == "json":
        report_factory = JSONReportFactory()
    else:
        raise HTTPException(status_code=400, detail="Invalid report type")

    facade = analytics_facade.AnalyticsFacade(db, report_factory)
    try:
        report = facade.generate_report(data_type)
        return report
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
