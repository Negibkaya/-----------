from sqlalchemy.orm import Session
import models
import schemas
from fastapi import APIRouter, Depends, HTTPException
from database import get_db

router = APIRouter(
    prefix="/expense_types",
    tags=["expense_types"],
)


@router.get("/", response_model=list[schemas.ExpenseType])
def read_expense_types(db: Session = Depends(get_db)):
    """Получает список всех типов расходов."""
    expense_types = db.query(models.ExpenseType).all()
    return expense_types


@router.get("/{expense_type_id}", response_model=schemas.ExpenseType)
def read_expense_type(expense_type_id: int, db: Session = Depends(get_db)):
    """Получает тип расходов по ID."""
    db_expense_type = db.query(models.ExpenseType).filter(
        models.ExpenseType.id == expense_type_id).first()
    if db_expense_type is None:
        raise HTTPException(status_code=404, detail="Expense Type not found")
    return db_expense_type


@router.post("/", response_model=schemas.ExpenseType)
def create_expense_type(expense_type: schemas.ExpenseTypeCreate, db: Session = Depends(get_db)):
    """Создает новый тип расходов."""
    existing_expense_type = db.query(models.ExpenseType).filter(
        models.ExpenseType.name == expense_type.name).first()
    if existing_expense_type:
        raise HTTPException(
            status_code=400, detail="Expense Type with this name already exists")

    db_expense_type = models.ExpenseType(**expense_type.dict())
    db.add(db_expense_type)
    db.commit()
    db.refresh(db_expense_type)
    return db_expense_type


@router.put("/{expense_type_id}", response_model=schemas.ExpenseType)
def update_expense_type(expense_type_id: int, expense_type_update: schemas.ExpenseTypeUpdate, db: Session = Depends(get_db)):
    """Обновляет данные типа расходов."""
    db_expense_type = db.query(models.ExpenseType).filter(
        models.ExpenseType.id == expense_type_id).first()
    if db_expense_type is None:
        raise HTTPException(status_code=404, detail="Expense Type not found")

    # Проверяем, не пытается ли пользователь задать имя, которое уже существует у другой записи
    existing_expense_type = db.query(models.ExpenseType).filter(
        models.ExpenseType.name == expense_type_update.name,
        models.ExpenseType.id != expense_type_id  # Исключаем текущую запись
    ).first()
    if existing_expense_type:
        raise HTTPException(
            status_code=400, detail="Expense Type with this name already exists")

    for key, value in expense_type_update.dict(exclude_unset=True).items():
        setattr(db_expense_type, key, value)
    db.commit()
    db.refresh(db_expense_type)
    return db_expense_type


@router.delete("/{expense_type_id}", response_model=schemas.ExpenseType)
def delete_expense_type(expense_type_id: int, db: Session = Depends(get_db)):
    """Удаляет тип расходов."""
    db_expense_type = db.query(models.ExpenseType).filter(
        models.ExpenseType.id == expense_type_id).first()
    if db_expense_type is None:
        raise HTTPException(status_code=404, detail="Expense Type not found")
    db.delete(db_expense_type)
    db.commit()
    return db_expense_type
