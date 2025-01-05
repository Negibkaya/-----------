from main import app
import models
from conftest import setup_database, client


# Тест на успешное получение списка типов расходов (пустая БД).


def test_read_expense_types_empty_db(setup_database):
    response = client.get("/expense_types/")
    assert response.status_code == 200
    assert response.json() == []

# Тест на успешное получение списка типов расходов (с данными в БД).


def test_read_expense_types_with_data(setup_database):
    # Создаем тестовые данные в БД.
    type1 = models.ExpenseType(name="Type A")
    type2 = models.ExpenseType(name="Type B")
    setup_database.add_all([type1, type2])
    setup_database.commit()

    # Выполняем запрос.
    response = client.get("/expense_types/")

    # Проверяем ответ.
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2

    # Сравниваем полученные данные с теми, что мы создали.
    assert data[0]["id"] == type1.id
    assert data[0]["name"] == type1.name
    assert data[1]["id"] == type2.id
    assert data[1]["name"] == type2.name

# Тест на успешное получение типа расхода по ID.


def test_read_expense_type_by_id(setup_database):
    expense_type = models.ExpenseType(name="Test Type")
    setup_database.add(expense_type)
    setup_database.commit()

    response = client.get(f"/expense_types/{expense_type.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == expense_type.id
    assert data["name"] == expense_type.name


# Тест на 404 ошибку, если тип расхода не найден.
def test_read_expense_type_not_found(setup_database):
    response = client.get("/expense_types/999")
    assert response.status_code == 404

# Тест на успешное создание типа расхода.


def test_create_expense_type(setup_database):
    expense_type_data = {
        "name": "New Expense Type"
    }
    response = client.post("/expense_types/", json=expense_type_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == expense_type_data["name"]

# Тест на ошибку 400, если тип расхода с таким именем уже существует


def test_create_expense_type_duplicate(setup_database):
    expense_type = models.ExpenseType(name="Duplicate Type")
    setup_database.add(expense_type)
    setup_database.commit()

    expense_type_data = {
        "name": "Duplicate Type"
    }

    response = client.post("/expense_types/", json=expense_type_data)
    assert response.status_code == 400
    assert response.json() == {
        'detail': 'Expense Type with this name already exists'}

# Тест на успешное обновление типа расхода.


def test_update_expense_type(setup_database):
    expense_type = models.ExpenseType(name="Old Type")
    setup_database.add(expense_type)
    setup_database.commit()

    update_data = {
        "name": "Updated Type"
    }
    response = client.put(
        f"/expense_types/{expense_type.id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == expense_type.id
    assert data["name"] == update_data["name"]

# Тест на ошибку 404 при обновлении, если тип расхода не найден.


def test_update_expense_type_not_found(setup_database):
    update_data = {"name": "Updated Type"}
    response = client.put("/expense_types/999", json=update_data)
    assert response.status_code == 404

# Тест на ошибку 400 при обновлении, если новое имя уже используется


def test_update_expense_type_duplicate(setup_database):
    expense_type1 = models.ExpenseType(name="Type One")
    expense_type2 = models.ExpenseType(name="Type Two")
    setup_database.add_all([expense_type1, expense_type2])
    setup_database.commit()

    update_data = {"name": "Type Two"}
    response = client.put(
        f"/expense_types/{expense_type1.id}", json=update_data)
    assert response.status_code == 400
    assert response.json() == {
        'detail': 'Expense Type with this name already exists'}

# Тест на успешное удаление типа расхода


def test_delete_expense_type(setup_database):
    expense_type = models.ExpenseType(name="Type to delete")
    setup_database.add(expense_type)
    setup_database.commit()
    response = client.delete(f"/expense_types/{expense_type.id}")
    assert response.status_code == 200
    response_get = client.get(f"/expense_types/{expense_type.id}")
    assert response_get.status_code == 404

# Тест на ошибку 404 при удалении, если тип расхода не найден


def test_delete_expense_type_not_found(setup_database):
    response = client.delete("/expense_types/999")
    assert response.status_code == 404
