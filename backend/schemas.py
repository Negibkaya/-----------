from datetime import datetime
from pydantic import BaseModel, ConfigDict
from typing import List, Optional


# Schemas for ExpenseType
class ExpenseTypeBase(BaseModel):
    name: str


class ExpenseTypeCreate(ExpenseTypeBase):
    pass


class ExpenseTypeUpdate(ExpenseTypeBase):
    name: Optional[str] = None


class ExpenseType(ExpenseTypeBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# Schemas for Expense
class ExpenseBase(BaseModel):
    business_trip_id: int
    expense_type_id: int
    amount: float


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseUpdate(ExpenseBase):
    business_trip_id: Optional[int] = None
    expense_type_id: Optional[int] = None
    amount: Optional[float] = None


class Expense(ExpenseBase):
    id: int
    expense_type: ExpenseType

    model_config = ConfigDict(from_attributes=True)


# Schemas for BusinessTrip
class BusinessTripBase(BaseModel):
    employee_id: int
    destination: Optional[str]
    start_trip: datetime
    end_trip: datetime


class BusinessTripCreate(BusinessTripBase):
    pass


class BusinessTripUpdate(BusinessTripBase):
    employee_id: Optional[int] = None
    destination: Optional[str] = None
    start_trip: Optional[datetime] = None
    end_trip: Optional[datetime] = None


class BusinessTrip(BusinessTripBase):
    id: int
    expenses: List[Expense] = []

    model_config = ConfigDict(from_attributes=True)


# Schemas for Employee
class EmployeeBase(BaseModel):
    fio: str


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(EmployeeBase):
    fio: Optional[str] = None


class Employee(EmployeeBase):
    id: int
    business_trips: List[BusinessTrip] = []

    model_config = ConfigDict(from_attributes=True)
