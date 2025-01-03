import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

from main import app
import models
import schemas
from database import Base, get_db

# Используем тестовую базу данных в файле внутри папки tests
SQLALCHEMY_DATABASE_URL = "sqlite:///./tests/test_db.db"

# Если переменная окружения не задана, используем тестовую БД в файле
if not os.environ.get("DATABASE_URL_TEST"):
    os.environ["DATABASE_URL_TEST"] = SQLALCHEMY_DATABASE_URL

engine = create_engine(
    os.environ.get("DATABASE_URL_TEST"), connect_args={"check_same_thread": False}
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
    print(response.json())
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
    # 1. Создаем несколько сотрудников в базе данных
    db = TestingSessionLocal()
    employee1 = models.Employee(fio="John Doe")
    employee2 = models.Employee(fio="Jane Smith")
    db.add_all([employee1, employee2])
    db.commit()

    # 2. Отправляем GET-запрос на эндпоинт /employees/
    response = client.get("/employees/")

    # 3. Проверяем статус код и содержимое ответа
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2  # Ожидаем, что в ответе будет 2 сотрудника

    # 4. Проверяем данные сотрудников в ответе
    employee_data_1 = next(
        (item for item in data if item["fio"] == "John Doe"), None)
    employee_data_2 = next(
        (item for item in data if item["fio"] == "Jane Smith"), None)

    assert employee_data_1 is not None
    assert employee_data_2 is not None

    assert employee_data_1["fio"] == "John Doe"
    assert "id" in employee_data_1
    assert employee_data_2["fio"] == "Jane Smith"
    assert "id" in employee_data_2
