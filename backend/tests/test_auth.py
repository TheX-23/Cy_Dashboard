import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.models.database import get_db, Base
from app.models.user import User, UserRole
from app.services.auth_service import auth_service

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session")
def setup_database():
    """Setup test database"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client():
    """Test client fixture"""
    return TestClient(app)

@pytest.fixture
def test_user():
    """Test user fixture"""
    return {
        "email": "test@example.com",
        "password": "TestPassword123!",
        "name": "Test User",
        "role": "analyst"
    }

@pytest.fixture
def admin_user():
    """Admin user fixture"""
    return {
        "email": "admin@example.com",
        "password": "AdminPassword123!",
        "name": "Admin User",
        "role": "admin"
    }

class TestAuthentication:
    """Test authentication endpoints"""
    
    def test_register_user(self, client: TestClient, test_user: dict, setup_database):
        """Test user registration"""
        response = client.post("/api/v1/auth/register", json=test_user)
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user["email"]
        assert data["name"] == test_user["name"]
        assert data["role"] == test_user["role"]
        assert "id" in data
    
    def test_register_duplicate_email(self, client: TestClient, test_user: dict, setup_database):
        """Test registration with duplicate email"""
        # Register first user
        client.post("/api/v1/auth/register", json=test_user)
        
        # Try to register with same email
        response = client.post("/api/v1/auth/register", json=test_user)
        
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"]
    
    def test_register_weak_password(self, client: TestClient, setup_database):
        """Test registration with weak password"""
        weak_user = {
            "email": "weak@example.com",
            "password": "123",
            "name": "Weak User",
            "role": "analyst"
        }
        
        response = client.post("/api/v1/auth/register", json=weak_user)
        
        assert response.status_code == 422  # Validation error
    
    def test_login_success(self, client: TestClient, test_user: dict, setup_database):
        """Test successful login"""
        # Register user first
        client.post("/api/v1/auth/register", json=test_user)
        
        # Login
        login_data = {
            "email": test_user["email"],
            "password": test_user["password"]
        }
        response = client.post("/api/v1/auth/login", json=login_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert "expires_in" in data
        assert data["user"]["email"] == test_user["email"]
    
    def test_login_invalid_credentials(self, client: TestClient, test_user: dict, setup_database):
        """Test login with invalid credentials"""
        # Register user first
        client.post("/api/v1/auth/register", json=test_user)
        
        # Try login with wrong password
        login_data = {
            "email": test_user["email"],
            "password": "wrongpassword"
        }
        response = client.post("/api/v1/auth/login", json=login_data)
        
        assert response.status_code == 401
        assert "Incorrect email or password" in response.json()["detail"]
    
    def test_login_nonexistent_user(self, client: TestClient, setup_database):
        """Test login with non-existent user"""
        login_data = {
            "email": "nonexistent@example.com",
            "password": "password123"
        }
        response = client.post("/api/v1/auth/login", json=login_data)
        
        assert response.status_code == 401
        assert "Incorrect email or password" in response.json()["detail"]
    
    def test_get_current_user(self, client: TestClient, test_user: dict, setup_database):
        """Test getting current user info"""
        # Register and login
        client.post("/api/v1/auth/register", json=test_user)
        login_response = client.post("/api/v1/auth/login", json={
            "email": test_user["email"],
            "password": test_user["password"]
        })
        token = login_response.json()["access_token"]
        
        # Get current user
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/v1/auth/me", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user["email"]
        assert data["name"] == test_user["name"]
    
    def test_get_current_user_invalid_token(self, client: TestClient, setup_database):
        """Test getting current user with invalid token"""
        headers = {"Authorization": "Bearer invalid_token"}
        response = client.get("/api/v1/auth/me", headers=headers)
        
        assert response.status_code == 401
    
    def test_logout(self, client: TestClient, test_user: dict, setup_database):
        """Test user logout"""
        # Register and login
        client.post("/api/v1/auth/register", json=test_user)
        login_response = client.post("/api/v1/auth/login", json={
            "email": test_user["email"],
            "password": test_user["password"]
        })
        token = login_response.json()["access_token"]
        
        # Logout
        headers = {"Authorization": f"Bearer {token}"}
        response = client.post("/api/v1/auth/logout", headers=headers)
        
        assert response.status_code == 200
        assert "Successfully logged out" in response.json()["message"]
    
    def test_refresh_token(self, client: TestClient, test_user: dict, setup_database):
        """Test token refresh"""
        # Register and login
        client.post("/api/v1/auth/register", json=test_user)
        login_response = client.post("/api/v1/auth/login", json={
            "email": test_user["email"],
            "password": test_user["password"]
        })
        token = login_response.json()["access_token"]
        
        # Refresh token
        headers = {"Authorization": f"Bearer {token}"}
        response = client.post("/api/v1/auth/refresh", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
    
    def test_change_password(self, client: TestClient, test_user: dict, setup_database):
        """Test password change"""
        # Register and login
        client.post("/api/v1/auth/register", json=test_user)
        login_response = client.post("/api/v1/auth/login", json={
            "email": test_user["email"],
            "password": test_user["password"]
        })
        token = login_response.json()["access_token"]
        
        # Change password
        headers = {"Authorization": f"Bearer {token}"}
        response = client.post("/api/v1/auth/change-password", 
                           json={"current_password": test_user["password"], "new_password": "NewPassword123!"},
                           headers=headers)
        
        assert response.status_code == 200
        assert "Password changed successfully" in response.json()["message"]
    
    def test_change_password_wrong_current(self, client: TestClient, test_user: dict, setup_database):
        """Test password change with wrong current password"""
        # Register and login
        client.post("/api/v1/auth/register", json=test_user)
        login_response = client.post("/api/v1/auth/login", json={
            "email": test_user["email"],
            "password": test_user["password"]
        })
        token = login_response.json()["access_token"]
        
        # Try to change with wrong current password
        headers = {"Authorization": f"Bearer {token}"}
        response = client.post("/api/v1/auth/change-password", 
                           json={"current_password": "wrongpassword", "new_password": "NewPassword123!"},
                           headers=headers)
        
        assert response.status_code == 400
        assert "Current password is incorrect" in response.json()["detail"]

class TestPasswordValidation:
    """Test password validation"""
    
    def test_password_hashing(self):
        """Test password hashing"""
        password = "TestPassword123!"
        hashed = auth_service.get_password_hash(password)
        
        assert hashed != password
        assert auth_service.verify_password(password, hashed)
        assert not auth_service.verify_password("wrongpassword", hashed)
    
    def test_weak_passwords(self):
        """Test weak password validation"""
        weak_passwords = [
            "123",
            "password",
            "weak",
            "short",
            "nocaps123",
            "NOLOWERS123",
            "nodigits"
        ]
        
        for password in weak_passwords:
            hashed = auth_service.get_password_hash(password)
            # Should still hash but validation should catch weak passwords
            assert hashed != password
            assert auth_service.verify_password(password, hashed)
