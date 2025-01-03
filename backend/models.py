from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    fio = Column(String, index=True, nullable=False)

    business_trips = relationship(
        "BusinessTrip", back_populates="employee", cascade="all, delete-orphan")


class BusinessTrip(Base):
    __tablename__ = "business_trips"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    destination = Column(String)
    start_trip = Column(DateTime, nullable=False)
    end_trip = Column(DateTime, nullable=False)

    employee = relationship("Employee", back_populates="business_trips")
    expenses = relationship(
        "Expense", back_populates="business_trip", cascade="all, delete-orphan")


class ExpenseType(Base):
    __tablename__ = "expense_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)

    expenses = relationship(
        "Expense", back_populates="expense_type", cascade="all, delete-orphan")


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    business_trip_id = Column(Integer, ForeignKey("business_trips.id"))
    expense_type_id = Column(Integer, ForeignKey("expense_types.id"))
    amount = Column(Float, nullable=False)

    business_trip = relationship("BusinessTrip", back_populates="expenses")
    expense_type = relationship("ExpenseType", back_populates="expenses")
