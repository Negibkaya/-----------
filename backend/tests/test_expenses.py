from datetime import datetime
from main import app
import models
from conftest import setup_database, client


# Вспомогательная функция для создания тестовых данных
def create_test_data(db):
    expense_type = models.ExpenseType(name="Test Type")
    business_trip = models.BusinessTrip(employee_id=1, destination="Test Destination",
                                        start_trip=datetime(2023, 1, 1), end_trip=datetime(2023, 1, 5))
    db.add_all([expense_type, business_trip])
    db.commit()
    return expense_type, business_trip


# Тест на успешное получение списка расходов (пустая БД).
def test_read_expenses_empty_db(setup_database):
    response = client.get("/expenses/")
    assert response.status_code == 200
    assert response.json() == []


# Тест на успешное получение списка расходов (с данными в БД).
def test_read_expenses_with_data(setup_database):
    expense_type, business_trip = create_test_data(setup_database)

    expense1 = models.Expense(
        business_trip_id=business_trip.id, expense_type_id=expense_type.id, amount=100.00)
    expense2 = models.Expense(
        business_trip_id=business_trip.id, expense_type_id=expense_type.id, amount=200.00)
    setup_database.add_all([expense1, expense2])
    setup_database.commit()

    response = client.get("/expenses/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2

    assert data[0]["id"] == expense1.id
    assert data[0]["business_trip_id"] == expense1.business_trip_id
    assert data[0]["expense_type_id"] == expense1.expense_type_id
    assert data[0]["amount"] == expense1.amount
    assert data[1]["id"] == expense2.id
    assert data[1]["business_trip_id"] == expense2.business_trip_id
    assert data[1]["expense_type_id"] == expense2.expense_type_id
    assert data[1]["amount"] == expense2.amount


# Тест на успешное получение расхода по ID.
def test_read_expense_by_id(setup_database):
    expense_type, business_trip = create_test_data(setup_database)
    expense = models.Expense(
        business_trip_id=business_trip.id, expense_type_id=expense_type.id, amount=150.00)
    setup_database.add(expense)
    setup_database.commit()

    response = client.get(f"/expenses/{expense.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == expense.id
    assert data["business_trip_id"] == expense.business_trip_id
    assert data["expense_type_id"] == expense.expense_type_id
    assert data["amount"] == expense.amount


# Тест на 404 ошибку, если расход не найден.
def test_read_expense_not_found(setup_database):
    response = client.get("/expenses/999")
    assert response.status_code == 404


# Тест на успешное создание расхода.
def test_create_expense(setup_database):
    expense_type, business_trip = create_test_data(setup_database)

    expense_data = {
        "business_trip_id": business_trip.id,
        "expense_type_id": expense_type.id,
        "amount": 250.00
    }
    response = client.post("/expenses/", json=expense_data)
    assert response.status_code == 200
    data = response.json()
    assert data["business_trip_id"] == expense_data["business_trip_id"]
    assert data["expense_type_id"] == expense_data["expense_type_id"]
    assert data["amount"] == expense_data["amount"]


# Тест на успешное обновление расхода.
def test_update_expense(setup_database):
    expense_type, business_trip = create_test_data(setup_database)
    expense = models.Expense(
        business_trip_id=business_trip.id, expense_type_id=expense_type.id, amount=300.00)
    setup_database.add(expense)
    setup_database.commit()

    update_data = {
        "amount": 350.00
    }
    response = client.put(f"/expenses/{expense.id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == expense.id
    assert data["amount"] == update_data["amount"]


# Тест на 404 ошибку при обновлении, если расход не найден.
def test_update_expense_not_found(setup_database):
    update_data = {"amount": 500.00}
    response = client.put("/expenses/999", json=update_data)
    assert response.status_code == 404


# Тест на успешное удаление расхода.
def test_delete_expense(setup_database):
    expense_type, business_trip = create_test_data(setup_database)
    expense = models.Expense(
        business_trip_id=business_trip.id, expense_type_id=expense_type.id, amount=400.00)
    setup_database.add(expense)
    setup_database.commit()

    response = client.delete(f"/expenses/{expense.id}")
    assert response.status_code == 200
    assert response.json() == {"message": "Expense deleted"}
    response_get = client.get(f"/expenses/{expense.id}")
    assert response_get.status_code == 404


# Тест на 404 ошибку при удалении, если расход не найден.
def test_delete_expense_not_found(setup_database):
    response = client.delete("/expenses/999")
    assert response.status_code == 404
