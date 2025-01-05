from main import app
import models
from conftest import setup_database, client


# Тест на успешное получение списка сотрудников (пустая БД).
def test_read_employees_empty_db(setup_database):
    response = client.get("/employees/")
    assert response.status_code == 200
    assert response.json() == []


# Тест на успешное получение списка сотрудников (с данными в БД).
def test_read_employees_with_data(setup_database):
    # Создаем тестовые данные в БД.
    employee1 = models.Employee(fio="Employee A")
    employee2 = models.Employee(fio="Employee B")
    setup_database.add_all([employee1, employee2])
    setup_database.commit()

    # Выполняем запрос.
    response = client.get("/employees/")

    # Проверяем ответ.
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2

    # Сравниваем полученные данные с теми, что мы создали.
    assert data[0]["id"] == employee1.id
    assert data[0]["fio"] == employee1.fio
    assert data[1]["id"] == employee2.id
    assert data[1]["fio"] == employee2.fio


# Тест на успешное получение сотрудника по ID.
def test_read_employee_by_id(setup_database):
    employee = models.Employee(fio="Test Employee")
    setup_database.add(employee)
    setup_database.commit()

    response = client.get(f"/employees/{employee.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == employee.id
    assert data["fio"] == employee.fio


# Тест на 404 ошибку, если сотрудник не найден.
def test_read_employee_not_found(setup_database):
    response = client.get("/employees/999")
    assert response.status_code == 404


# Тест на успешное создание сотрудника.
def test_create_employee(setup_database):
    employee_data = {
        "fio": "New Employee"
    }
    response = client.post("/employees/", json=employee_data)
    assert response.status_code == 200
    data = response.json()
    assert data["fio"] == employee_data["fio"]


# Тест на успешное обновление сотрудника.
def test_update_employee(setup_database):
    employee = models.Employee(fio="Old Employee")
    setup_database.add(employee)
    setup_database.commit()

    update_data = {
        "fio": "Updated Employee"
    }
    response = client.put(f"/employees/{employee.id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == employee.id
    assert data["fio"] == update_data["fio"]

# Тест на 404 ошибку при обновлении, если сотрудник не найден.


def test_update_employee_not_found(setup_database):
    update_data = {"fio": "Updated Employee"}
    response = client.put("/employees/999", json=update_data)
    assert response.status_code == 404

# Тест на успешное удаление сотрудника.


def test_delete_employee(setup_database):
    employee = models.Employee(fio="Employee to delete")
    setup_database.add(employee)
    setup_database.commit()
    response = client.delete(f"/employees/{employee.id}")
    assert response.status_code == 200
    assert response.json() == {"message": "Employee deleted"}
    response_get = client.get(f"/employees/{employee.id}")
    assert response_get.status_code == 404

# Тест на ошибку 404 при удалении, если сотрудник не найден.


def test_delete_employee_not_found(setup_database):
    response = client.delete("/employees/999")
    assert response.status_code == 404
