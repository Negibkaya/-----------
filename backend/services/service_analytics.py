from sqlalchemy import func
from sqlalchemy.orm import Session
from datetime import timedelta

from models import Employee, BusinessTrip, Expense, ExpenseType


def get_total_expenses(db: Session):
    """Получить общую сумму всех расходов."""
    return db.query(func.sum(Expense.amount)).scalar() or 0.0


def get_expenses_by_employee(db: Session):
    """Получить общую сумму расходов для каждого сотрудника."""
    return (
        db.query(Employee.fio, func.sum(
            Expense.amount).label("total_expenses"))
        .join(BusinessTrip, Employee.id == BusinessTrip.employee_id)
        .join(Expense, BusinessTrip.id == Expense.business_trip_id)
        .group_by(Employee.fio)
        .all()
    )


def get_expenses_by_expense_type(db: Session):
    """Получить общую сумму расходов по типам расходов."""
    return (
        db.query(ExpenseType.name, func.sum(
            Expense.amount).label("total_expenses"))
        .join(Expense, ExpenseType.id == Expense.expense_type_id)
        .group_by(ExpenseType.name)
        .all()
    )


def get_employees_with_most_trips(db: Session, limit: int = 5):
    """Получить список сотрудников с наибольшим количеством командировок."""
    return (
        db.query(Employee.fio, func.count(BusinessTrip.id).label("trip_count"))
        .join(BusinessTrip, Employee.id == BusinessTrip.employee_id)
        .group_by(Employee.fio)
        .order_by(func.count(BusinessTrip.id).desc())
        .limit(limit)
        .all()
    )


def get_most_popular_destinations(db: Session, limit: int = 5):
    """Получить список самых популярных направлений командировок."""
    return (
        db.query(BusinessTrip.destination, func.count().label("trip_count"))
        .group_by(BusinessTrip.destination)
        .order_by(func.count().desc())
        .limit(limit)
        .all()
    )


def get_average_expense_per_trip(db: Session):
    """Получить среднюю сумму расходов на одну командировку."""
    subquery = (
        db.query(BusinessTrip.id, func.sum(
            Expense.amount).label("total_trip_expense"))
        .join(Expense, BusinessTrip.id == Expense.business_trip_id)
        .group_by(BusinessTrip.id)
        .subquery()
    )
    return db.query(func.avg(subquery.c.total_trip_expense)).scalar() or 0.0
