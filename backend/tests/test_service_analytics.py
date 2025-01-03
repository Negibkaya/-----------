import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from services.service_analytics import (
    get_total_expenses,
    get_expenses_by_employee,
    get_expenses_by_expense_type,
    get_employees_with_most_trips,
    get_most_popular_destinations,
    get_average_expense_per_trip,
)
from models import Base, Employee, BusinessTrip, Expense, ExpenseType
from pytest_mock import MockerFixture

# Создаем тестовую базу данных в памяти
engine = create_engine("sqlite:///:memory:")
TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine)

# Создаем таблицы
Base.metadata.create_all(bind=engine)


@pytest.fixture()
def db_session():
    """Фикстура для создания сессии БД."""
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session  # Предоставляем сессию тестам

    session.close()
    transaction.rollback()
    connection.close()


def test_get_total_expenses(db_session, mocker: MockerFixture):
    # Мокаем запрос к БД, чтобы он возвращал предопределенное значение
    mock_query = mocker.patch.object(db_session, "query")
    mock_query.return_value.scalar.return_value = 150.5

    result = get_total_expenses(db_session)
    assert result == 150.5
    mock_query.assert_called_once()


def test_get_total_expenses_empty(db_session, mocker: MockerFixture):
    # Мокаем запрос к БД, чтобы он возвращал None (как будто расходов нет)
    mock_query = mocker.patch.object(db_session, "query")
    mock_query.return_value.scalar.return_value = None

    result = get_total_expenses(db_session)
    assert result == 0.0
    mock_query.assert_called_once()


def test_get_expenses_by_employee(db_session, mocker: MockerFixture):
    # Создаем мок-данные для возврата из БД
    mock_result = [
        ("Иванов И.И.", 250.0),
        ("Петров П.П.", 100.0),
    ]
    # Мокаем запрос к БД
    mock_query = mocker.patch.object(db_session, "query")
    mock_query.return_value.join.return_value.join.return_value.group_by.return_value.all.return_value = mock_result

    result = get_expenses_by_employee(db_session)
    assert result == mock_result
    mock_query.assert_called_once()


def test_get_expenses_by_expense_type(db_session, mocker: MockerFixture):
    mock_result = [
        ("Проживание", 300.0),
        ("Питание", 150.0),
    ]
    mock_query = mocker.patch.object(db_session, "query")
    mock_query.return_value.join.return_value.group_by.return_value.all.return_value = mock_result

    result = get_expenses_by_expense_type(db_session)
    assert result == mock_result
    mock_query.assert_called_once()


def test_get_employees_with_most_trips(db_session, mocker: MockerFixture):
    mock_result = [
        ("Сидоров С.С.", 5),
        ("Иванов И.И.", 3),
    ]
    mock_query = mocker.patch.object(db_session, "query")
    mock_query.return_value.join.return_value.group_by.return_value.order_by.return_value.limit.return_value.all.return_value = mock_result

    result = get_employees_with_most_trips(db_session, limit=2)
    assert result == mock_result
    mock_query.assert_called_once()


def test_get_most_popular_destinations(db_session, mocker: MockerFixture):
    mock_result = [
        ("Москва", 10),
        ("Санкт-Петербург", 8),
    ]
    mock_query = mocker.patch.object(db_session, "query")
    mock_query.return_value.group_by.return_value.order_by.return_value.limit.return_value.all.return_value = mock_result

    result = get_most_popular_destinations(db_session, limit=2)
    assert result == mock_result
    mock_query.assert_called_once()


def test_get_average_expense_per_trip(db_session, mocker: MockerFixture):
    mock_query = mocker.patch.object(db_session, "query")
    mock_subquery = mocker.MagicMock()  # Используем MagicMock для subquery
    mock_query.return_value.join.return_value.group_by.return_value.subquery.return_value = mock_subquery
    mock_query.return_value.scalar.return_value = 200.0

    result = get_average_expense_per_trip(db_session)
    assert result == 200.0
    mock_query.assert_called()  # Проверяем, что query был вызван


def test_get_average_expense_per_trip_empty(db_session, mocker: MockerFixture):
    mock_query = mocker.patch.object(db_session, "query")
    mock_subquery = mocker.MagicMock()
    mock_query.return_value.join.return_value.group_by.return_value.subquery.return_value = mock_subquery
    mock_query.return_value.scalar.return_value = None

    result = get_average_expense_per_trip(db_session)
    assert result == 0.0
    mock_query.assert_called()
