from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends
from database import get_db
from services import service_analytics

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
    total_expenses = service_analytics.get_total_expenses(db)
    expenses_by_employee = service_analytics.get_expenses_by_employee(db)
    expenses_by_expense_type = service_analytics.get_expenses_by_expense_type(
        db)
    employees_with_most_trips = service_analytics.get_employees_with_most_trips(
        db)
    most_popular_destinations = service_analytics.get_most_popular_destinations(
        db)
    average_expense_per_trip = service_analytics.get_average_expense_per_trip(
        db)

    return {
        "total_expenses": total_expenses,
        "expenses_by_employee": [{"employee": fio, "total_expenses": expenses} for fio, expenses in expenses_by_employee],
        "expenses_by_expense_type": [{"expense_type": name, "total_expenses": expenses} for name, expenses in expenses_by_expense_type],
        "employees_with_most_trips": [{"employee": fio, "trip_count": count} for fio, count in employees_with_most_trips],
        "most_popular_destinations": [{"destination": destination, "trip_count": count} for destination, count in most_popular_destinations],
        "average_expense_per_trip": average_expense_per_trip,
    }
