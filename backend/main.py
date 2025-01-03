from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
from routers import employees, expense_types, business_trips, expenses, analytics
import uvicorn
import models

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(employees.router)
app.include_router(expense_types.router)
app.include_router(business_trips.router)
app.include_router(expenses.router)
app.include_router(analytics.router)


# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # URL вашего frontend приложения
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"Message": "test message (root) X2"}


if __name__ == "__main__":
    uvicorn.run("main:app", reload=True)
