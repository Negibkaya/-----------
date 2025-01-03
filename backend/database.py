from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# SQLALCHEMY_DATABASE_URL = "postgresql://postgres:1595@localhost:5432/postgres"
SQLALCHEMY_DATABASE_URL = "sqlite:///./trip.db"


engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_size=10,  # Увеличьте pool_size
    max_overflow=20  # Увеличьте max_overflow
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close
