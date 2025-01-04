from sqlalchemy.orm import Session
import models
import schemas
from fastapi import APIRouter, Depends, HTTPException
from database import get_db


router = APIRouter(
    prefix="/expenses",
    tags=["expenses"],
)


@router.get("/", response_model=list[schemas.Expense])
def read_expenses(db: Session = Depends(get_db)):
    """Получает список всех расходов."""
    expenses = db.query(models.Expense).all()
    return expenses


@router.get("/{expense_id}", response_model=schemas.Expense)
def read_expense(expense_id: int, db: Session = Depends(get_db)):
    """Получает расход по ID."""
    expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense


@router.post("/", response_model=schemas.Expense)
def create_expense(expense: schemas.ExpenseCreate, db: Session = Depends(get_db)):
    """Создает новый расход."""
    db_expense = models.Expense(**expense.dict())
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense


@router.put("/{expense_id}", response_model=schemas.Expense)
def update_expense(expense_id: int, expense: schemas.ExpenseUpdate, db: Session = Depends(get_db)):
    """Обновляет данные расхода."""
    db_expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id).first()
    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    update_data = expense.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_expense, key, value)
    db.commit()
    db.refresh(db_expense)
    return db_expense


@router.delete("/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    """Удаляет расход."""
    db_expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id).first()
    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(db_expense)
    db.commit()
    return {"message": "Expense deleted"}
