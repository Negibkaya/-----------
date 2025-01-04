from sqlalchemy.orm import Session
import models
import schemas
from fastapi import APIRouter, Depends, HTTPException
from database import get_db


router = APIRouter(
    prefix="/business_trips",
    tags=["business_trips"],
)


@router.get("/", response_model=list[schemas.BusinessTrip])
def read_business_trips(db: Session = Depends(get_db)):
    """Получает список всех поездок."""
    business_trips = db.query(models.BusinessTrip).all()
    return business_trips


@router.get("/{business_trips_id}", response_model=schemas.BusinessTrip)
def read_business_trips(business_trips_id: int, db: Session = Depends(get_db)):
    """Получает поездку по ID."""
    db_business_trip = db.query(models.BusinessTrip).filter(
        models.BusinessTrip.id == business_trips_id).first()
    if not db_business_trip:
        raise HTTPException(status_code=404, detail="Business Trip not found")
    return db_business_trip


@router.post("/", response_model=schemas.BusinessTrip)
def create_business_trip(business_trip: schemas.BusinessTripCreate, db: Session = Depends(get_db)):
    """Создает новую поездку."""
    db_business_trip = models.BusinessTrip(**business_trip.dict())
    db.add(db_business_trip)
    db.commit()
    db.refresh(db_business_trip)
    return db_business_trip


@router.put("/{business_trips_id}", response_model=schemas.BusinessTrip)
def update_business_trips(business_trips_id: int, business_trip: schemas.BusinessTripUpdate, db: Session = Depends(get_db)):
    """Обновляет данные поездки."""
    db_business_trip = db.query(models.BusinessTrip).filter(
        models.BusinessTrip.id == business_trips_id).first()
    if not db_business_trip:
        raise HTTPException(status_code=404, detail="Business Trip not found")
    update_data = business_trip.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_business_trip, key, value)
    db.commit()
    db.refresh(db_business_trip)
    return db_business_trip


@router.delete("/{business_trips_id}")
def delete_business_trips(business_trips_id: int, db: Session = Depends(get_db)):
    """Удаляет поездку."""
    db_business_trip = db.query(models.BusinessTrip).filter(
        models.BusinessTrip.id == business_trips_id).first()
    if not db_business_trip:
        raise HTTPException(status_code=404, detail="Business Trip not found")
    db.delete(db_business_trip)
    db.commit()
    return {"message": "Business Trip deleted"}
