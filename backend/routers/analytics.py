from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends
from database import get_db
from services import service_analytics

from typing import List, Dict, Any

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"],
)


@router.get("/total-expenses")
def read_total_expenses(db: Session = Depends(get_db)):
    """Получить общую сумму всех расходов."""
    return service_analytics.get_total_expenses(db)


@router.get("/expenses-by-employee")
def read_expenses_by_employee(db: Session = Depends(get_db)):
    """Получить общую сумму расходов для каждого сотрудника."""
    results = service_analytics.get_expenses_by_employee(db)
    return [{"employee": fio, "total_expenses": expenses} for fio, expenses in results]


@router.get("/expenses-by-expense-type")
def read_expenses_by_expense_type(db: Session = Depends(get_db)):
    """Получить общую сумму расходов по типам расходов."""
    results = service_analytics.get_expenses_by_expense_type(db)
    return [{"expense_type": name, "total_expenses": expenses} for name, expenses in results]


@router.get("/employees-with-most-trips")
def read_employees_with_most_trips(db: Session = Depends(get_db), limit: int = 5):
    """Получить список сотрудников с наибольшим количеством командировок."""
    results = service_analytics.get_employees_with_most_trips(db, limit)
    return [{"employee": fio, "trip_count": count} for fio, count in results]


@router.get("/most-popular-destinations")
def read_most_popular_destinations(db: Session = Depends(get_db), limit: int = 5):
    """Получить список самых популярных направлений командировок."""
    results = service_analytics.get_most_popular_destinations(db, limit)
    return [{"destination": destination, "trip_count": count} for destination, count in results]


@router.get("/average-expense-per-trip")
def read_average_expense_per_trip(db: Session = Depends(get_db)):
    """Получить среднюю сумму расходов на одну командировку."""
    return service_analytics.get_average_expense_per_trip(db)
