import numpy as np
from sqlalchemy import func
from sqlalchemy.orm import Session
from models import Employee, BusinessTrip, Expense, ExpenseType


def get_total_expenses(db: Session):
    """Получить общую сумму всех расходов с использованием NumPy."""
    expenses = db.query(Expense.amount).all()
    expenses_array = np.array([expense[0]
                              for expense in expenses], dtype=float)
    return np.sum(expenses_array)


def get_expenses_by_employee(db: Session):
    """Получить общую сумму расходов для каждого сотрудника с использованием NumPy."""
    query = (
        db.query(Employee.fio, Expense.amount)
        .join(BusinessTrip, Employee.id == BusinessTrip.employee_id)
        .join(Expense, BusinessTrip.id == Expense.business_trip_id)
        .all()
    )
    data = np.array(query)
    fios = data[:, 0]  # Список сотрудников
    amounts = data[:, 1].astype(float)  # Список расходов

    # Суммируем расходы по каждому сотруднику
    unique_fios, total_expenses = np.unique(fios, return_inverse=True)
    total_expenses = np.bincount(total_expenses, weights=amounts)
    return list(zip(unique_fios, total_expenses))


def get_expenses_by_expense_type(db: Session):
    """Получить общую сумму расходов по типам расходов с использованием NumPy."""
    query = (
        db.query(ExpenseType.name, Expense.amount)
        .join(Expense, ExpenseType.id == Expense.expense_type_id)
        .all()
    )
    data = np.array(query)
    expense_types = data[:, 0]  # Типы расходов
    amounts = data[:, 1].astype(float)  # Суммы расходов

    # Суммируем расходы по каждому типу
    unique_types, total_expenses = np.unique(
        expense_types, return_inverse=True)
    total_expenses = np.bincount(total_expenses, weights=amounts)
    return list(zip(unique_types, total_expenses))


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
    """Получить среднюю сумму расходов на одну командировку с использованием NumPy."""
    query = (
        db.query(BusinessTrip.id, Expense.amount)
        .join(Expense, BusinessTrip.id == Expense.business_trip_id)
        .all()
    )
    data = np.array(query)
    trip_ids = data[:, 0]  # Идентификаторы командировок
    amounts = data[:, 1].astype(float)  # Суммы расходов

    # Суммируем расходы по каждой командировке
    unique_trip_ids, trip_expenses = np.unique(trip_ids, return_inverse=True)
    trip_expenses = np.bincount(trip_expenses, weights=amounts)

    # Вычисляем среднее значение
    return np.mean(trip_expenses) if len(trip_expenses) > 0 else 0.0
