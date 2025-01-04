from fastapi import status
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import datetime

from models import BusinessTrip, Employee


def test_create_business_trip(client: TestClient, get_test_db: Session):
    # Создаем тестового сотрудника
    employee_data = {"fio": "Иван Иванов"}
    db_employee = Employee(**employee_data)
    get_test_db.add(db_employee)
    get_test_db.commit()
    get_test_db.refresh(db_employee)

    business_trip_data = {
        "destination": "Moscow",
        "start_trip": "2024-10-26T09:00:00",
        "end_trip": "2024-10-30T17:00:00",
        "employee_id": db_employee.id
    }
    response = client.post("/business_trips/", json=business_trip_data)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["destination"] == business_trip_data["destination"]
    assert data["start_trip"] == business_trip_data["start_trip"]
    assert data["end_trip"] == business_trip_data["end_trip"]
    assert data["employee_id"] == business_trip_data["employee_id"]
    assert "id" in data


def test_read_business_trips(client: TestClient, get_test_db: Session):
    # Создаем тестового сотрудника
    employee_data = {"fio": "Петр Петров"}
    db_employee = Employee(**employee_data)
    get_test_db.add(db_employee)
    get_test_db.commit()
    get_test_db.refresh(db_employee)

    # Создаем несколько тестовых поездок
    trip_data_1 = {"destination": "London", "start_trip": datetime(
        2024, 11, 1, 10, 0, 0), "end_trip": datetime(2024, 11, 5, 18, 0, 0), "employee_id": db_employee.id}
    trip_data_2 = {"destination": "Paris", "start_trip": datetime(
        2024, 11, 10, 9, 0, 0), "end_trip": datetime(2024, 11, 15, 17, 0, 0), "employee_id": db_employee.id}
    get_test_db.add_all([BusinessTrip(**trip_data_1),
                        BusinessTrip(**trip_data_2)])
    get_test_db.commit()

    response = client.get("/business_trips/")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 2
    # Можно добавить более детальные проверки содержимого, если необходимо


def test_read_business_trip(client: TestClient, get_test_db: Session):
    # Создаем тестового сотрудника
    employee_data = {"fio": "Сидор Сидоров"}
    db_employee = Employee(**employee_data)
    get_test_db.add(db_employee)
    get_test_db.commit()
    get_test_db.refresh(db_employee)

    # Создаем тестовую поездку
    trip_data = {"destination": "Berlin", "start_trip": datetime(
        2024, 11, 20, 11, 0, 0), "end_trip": datetime(2024, 11, 25, 19, 0, 0), "employee_id": db_employee.id}
    db_trip = BusinessTrip(**trip_data)
    get_test_db.add(db_trip)
    get_test_db.commit()
    get_test_db.refresh(db_trip)

    response = client.get(f"/business_trips/{db_trip.id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["destination"] == trip_data["destination"]
    assert data["start_trip"] == trip_data["start_trip"].isoformat()
    assert data["end_trip"] == trip_data["end_trip"].isoformat()
    assert data["employee_id"] == trip_data["employee_id"]
    assert "id" in data


def test_read_business_trip_not_found(client: TestClient, get_test_db: Session):
    response = client.get("/business_trips/999")
    assert response.status_code == status.HTTP_404_NOT_FOUND
    data = response.json()
    assert data["detail"] == "Business Trip not found"


def test_update_business_trip(client: TestClient, get_test_db: Session):
    # Создаем тестового сотрудника
    employee_data = {"fio": "Алексей Алексеев"}
    db_employee = Employee(**employee_data)
    get_test_db.add(db_employee)
    get_test_db.commit()
    get_test_db.refresh(db_employee)

    # Создаем тестовую поездку
    trip_data = {"destination": "Rome", "start_trip": datetime(
        2024, 12, 1, 10, 0, 0), "end_trip": datetime(2024, 12, 5, 18, 0, 0), "employee_id": db_employee.id}
    db_trip = BusinessTrip(**trip_data)
    get_test_db.add(db_trip)
    get_test_db.commit()
    get_test_db.refresh(db_trip)

    update_data = {"destination": "Milan", "end_trip": "2024-12-04T12:00:00"}
    response = client.put(f"/business_trips/{db_trip.id}", json=update_data)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["destination"] == update_data["destination"]
    assert data["end_trip"] == update_data["end_trip"]

    # Проверяем, что данные действительно обновились в БД
    get_test_db.refresh(db_trip)
    assert db_trip.destination == update_data["destination"]
    assert db_trip.end_trip == datetime.fromisoformat(update_data["end_trip"])


def test_update_business_trip_not_found(client: TestClient, get_test_db: Session):
    update_data = {"destination": "Milan"}
    response = client.put("/business_trips/999", json=update_data)
    assert response.status_code == status.HTTP_404_NOT_FOUND
    data = response.json()
    assert data["detail"] == "Business Trip not found"


def test_delete_business_trip(client: TestClient, get_test_db: Session):
    # Создаем тестового сотрудника
    employee_data = {"fio": "Елена Иванова"}
    db_employee = Employee(**employee_data)
    get_test_db.add(db_employee)
    get_test_db.commit()
    get_test_db.refresh(db_employee)

    # Создаем тестовую поездку
    trip_data = {"destination": "Madrid", "start_trip": datetime(
        2025, 1, 10, 10, 0, 0), "end_trip": datetime(2025, 1, 15, 18, 0, 0), "employee_id": db_employee.id}
    db_trip = BusinessTrip(**trip_data)
    get_test_db.add(db_trip)
    get_test_db.commit()

    response = client.delete(f"/business_trips/{db_trip.id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["message"] == "Business Trip deleted"

    # Проверяем, что поездка действительно удалена
    deleted_trip = get_test_db.query(BusinessTrip).filter(
        BusinessTrip.id == db_trip.id).first()
    assert deleted_trip is None


def test_delete_business_trip_not_found(client: TestClient, get_test_db: Session):
    response = client.delete("/business_trips/999")
    assert response.status_code == status.HTTP_404_NOT_FOUND
    data = response.json()
    assert data["detail"] == "Business Trip not found"
