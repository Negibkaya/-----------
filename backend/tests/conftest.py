from fastapi.testclient import TestClient
import pytest
from typing import Generator
from fastapi import FastAPI
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database import Base
from main import app as fastapi_app

SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./tests/test_db.db"


engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL, connect_args={
                       "check_same_thread": False})
TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function", autouse=True)
def create_test_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def get_test_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture()
def client() -> Generator:
    with TestClient(fastapi_app) as c:
        yield c
