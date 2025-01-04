import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

from main import app
import models
import schemas
from database import Base, get_db

SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./tests/test_db.db"

engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False}
                       )
TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(scope="function")
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def test_create_employee(setup_database):
    employee_data = {
        "fio": "John Doe",
    }
    response = client.post("/employees/", json=employee_data)
    assert response.status_code == 200
    data = response.json()
    assert data["fio"] == employee_data["fio"]
    assert "id" in data

    db = TestingSessionLocal()
    db_employee = db.query(models.Employee).filter(
        models.Employee.id == data["id"]).first()
    assert db_employee is not None
    assert db_employee.fio == employee_data["fio"]


def test_read_employees(setup_database):
    # Создаем несколько сотрудников в базе данных
    db = TestingSessionLocal()
    employees = [models.Employee(fio="John Doe"),
                 models.Employee(fio="Jane Smith")]
    db.add_all(employees)
    db.commit()

    # Отправляем GET-запрос на эндпоинт /employees/
    response = client.get("/employees/")

    # Проверяем статус код и содержимое ответа
    assert response.status_code == 200
    data = response.json()
    assert len(data) == len(employees)

    # Проверяем данные сотрудников в ответе
    for emp in employees:
        emp_data = next(
            (item for item in data if item["fio"] == emp.fio), None)
        assert emp_data is not None
        assert emp_data["fio"] == emp.fio
        assert "id" in emp_data
