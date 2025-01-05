from datetime import datetime
from main import app
import models
from conftest import setup_database, client


def test_read_business_trips_empty_db(setup_database):
    response = client.get("/business_trips/")
    assert response.status_code == 200
    assert response.json() == []

# Тест на успешное получение списка поездок (с данными в БД).


def test_read_business_trips_with_data(setup_database):
    # Создаем тестовые данные в БД.
    trip1 = models.BusinessTrip(employee_id=1, destination="City A", start_trip=datetime(
        2023, 1, 1), end_trip=datetime(2023, 1, 5))
    trip2 = models.BusinessTrip(employee_id=2, destination="City B", start_trip=datetime(
        2023, 2, 10), end_trip=datetime(2023, 2, 15))
    setup_database.add_all([trip1, trip2])
    setup_database.commit()

    # Выполняем запрос.
    response = client.get("/business_trips/")

    # Проверяем ответ.
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2

    # Сравниваем полученные данные с теми, что мы создали.
    assert data[0]["id"] == trip1.id
    assert data[0]["employee_id"] == trip1.employee_id
    assert data[0]["destination"] == trip1.destination
    assert data[0]["start_trip"] == trip1.start_trip.isoformat()
    assert data[0]["end_trip"] == trip1.end_trip.isoformat()

    assert data[1]["id"] == trip2.id
    assert data[1]["employee_id"] == trip2.employee_id
    assert data[1]["destination"] == trip2.destination
    assert data[1]["start_trip"] == trip2.start_trip.isoformat()
    assert data[1]["end_trip"] == trip2.end_trip.isoformat()


# Тест на успешное получение поездки по ID.
def test_read_business_trip_by_id(setup_database):
    trip = models.BusinessTrip(employee_id=1, destination="City C", start_trip=datetime(
        2023, 3, 1), end_trip=datetime(2023, 3, 5))
    setup_database.add(trip)
    setup_database.commit()

    response = client.get(f"/business_trips/{trip.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == trip.id
    assert data["employee_id"] == trip.employee_id
    assert data["destination"] == trip.destination
    assert data["start_trip"] == trip.start_trip.isoformat()
    assert data["end_trip"] == trip.end_trip.isoformat()


# Тест на 404 ошибку, если поездка не найдена.
def test_read_business_trip_not_found(setup_database):
    response = client.get("/business_trips/999")
    assert response.status_code == 404


# Тест на успешное создание поездки.
def test_create_business_trip(setup_database):
    trip_data = {
        "employee_id": 1,
        "destination": "City D",
        "start_trip": "2023-04-01T00:00:00",
        "end_trip": "2023-04-05T00:00:00",
    }
    response = client.post("/business_trips/", json=trip_data)
    assert response.status_code == 200
    data = response.json()
    assert data["employee_id"] == trip_data["employee_id"]
    assert data["destination"] == trip_data["destination"]
    assert data["start_trip"] == trip_data["start_trip"]
    assert data["end_trip"] == trip_data["end_trip"]


# Тест на успешное обновление поездки.
def test_update_business_trip(setup_database):
    trip = models.BusinessTrip(employee_id=1, destination="City E", start_trip=datetime(
        2023, 5, 1), end_trip=datetime(2023, 5, 5))
    setup_database.add(trip)
    setup_database.commit()

    update_data = {
        "destination": "Updated City",
        "end_trip": "2023-05-10T00:00:00"
    }
    response = client.put(f"/business_trips/{trip.id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == trip.id
    assert data["destination"] == update_data["destination"]
    assert data["end_trip"] == update_data["end_trip"]


# Тест на ошибку 404 при обновлении, если поездка не найдена.
def test_update_business_trip_not_found(setup_database):
    update_data = {"destination": "Updated City"}
    response = client.put("/business_trips/999", json=update_data)
    assert response.status_code == 404

# Тест на успешное удаление поездки


def test_delete_business_trip(setup_database):
    trip = models.BusinessTrip(employee_id=1, destination="City F", start_trip=datetime(
        2023, 6, 1), end_trip=datetime(2023, 6, 5))
    setup_database.add(trip)
    setup_database.commit()
    response = client.delete(f"/business_trips/{trip.id}")
    assert response.status_code == 200
    assert response.json() == {"message": "Business Trip deleted"}
    response_get = client.get(f"/business_trips/{trip.id}")
    assert response_get.status_code == 404

# Тест на ошибку 404 при удалении, если поездка не найдена


def test_delete_business_trip_not_found(setup_database):
    response = client.delete("/business_trips/999")
    assert response.status_code == 404
