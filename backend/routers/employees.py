from sqlalchemy.orm import Session
import models
import schemas
from fastapi import HTTPException, APIRouter, Depends
from database import get_db

router = APIRouter(
    prefix="/employees",
    tags=["employees"],
)


def get_employee_by_id(db: Session, employee_id: int):
    """Получает сотрудника по ID или выбрасывает исключение, если сотрудник не найден."""
    employee = db.query(models.Employee).filter(
        models.Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee


@router.get("/", response_model=list[schemas.Employee])
def read_employees(db: Session = Depends(get_db)):
    """Получает список всех сотрудников."""
    employees = db.query(models.Employee).all()
    return employees


@router.get("/{employee_id}", response_model=schemas.Employee)
def read_employee(employee_id: int, db: Session = Depends(get_db)):
    """Получает сотрудника по ID."""
    return get_employee_by_id(db, employee_id)


@router.post("/", response_model=schemas.Employee)
def create_employee(employee: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    """Создает нового сотрудника."""
    db_employee = models.Employee(**employee.dict())
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee


@router.put("/{employee_id}", response_model=schemas.Employee)
def update_employee(employee_id: int, employee: schemas.EmployeeUpdate, db: Session = Depends(get_db)):
    """Обновляет данные сотрудника."""
    db_employee = get_employee_by_id(db, employee_id)
    update_data = employee.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_employee, key, value)
    db.commit()
    db.refresh(db_employee)
    return db_employee


@router.delete("/{employee_id}")
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    """Удаляет сотрудника."""
    db_employee = get_employee_by_id(db, employee_id)
    db.delete(db_employee)
    db.commit()
    return {"message": "Employee deleted"}
