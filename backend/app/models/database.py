from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

from sqlalchemy.types import JSON
try:
    from sqlalchemy.dialects.postgresql import JSONB as PG_JSONB
except ImportError:
    PG_JSONB = JSON

import uuid
from sqlalchemy.types import TypeDecorator, CHAR
try:
    from sqlalchemy.dialects.postgresql import UUID as PG_UUID
except ImportError:
    PG_UUID = None

class GUID(TypeDecorator):
    """Platform-independent GUID type.
    Uses PostgreSQL's UUID type, otherwise uses CHAR(32), storing as stringified hex values.
    """
    impl = CHAR
    cache_ok = True

    def __init__(self, *args, **kwargs):
        kwargs.pop('as_uuid', None)
        super().__init__(*args, **kwargs)

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql' and PG_UUID is not None:
            return dialect.type_descriptor(PG_UUID(as_uuid=True))
        else:
            return dialect.type_descriptor(CHAR(32))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
            return value
        else:
            if isinstance(value, uuid.UUID):
                return value.hex
            else:
                return uuid.UUID(value).hex

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        else:
            if not isinstance(value, uuid.UUID):
                # If it's a string representing a short integer (like "1"), convert to integer
                if isinstance(value, str) and value.isdigit() and len(value) < 32:
                    value = int(value)
                
                if isinstance(value, int):
                    value = f"{value:032x}"
                    
                if isinstance(value, str):
                    value = value.replace('-', '')
                    
                return uuid.UUID(value)
            return value

UUID = GUID

JSONB = PG_JSONB if not settings.DATABASE_URL.startswith("sqlite") else JSON

# Create database engine
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=settings.LOG_LEVEL == "DEBUG"
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()

# Metadata for migrations
metadata = MetaData()


def get_db():
    """
    Dependency to get database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
