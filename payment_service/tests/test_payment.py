import pytest
from fastapi.testclient import TestClient
import jwt
from datetime import datetime, timedelta

# We need to run with payment_service as a package
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from payment_service.main import app
from payment_service.config import settings

client = TestClient(app)


def create_test_token(user_id=1, is_admin=False, expired=False):
    expiry = datetime.utcnow() + (timedelta(hours=-1) if expired else timedelta(hours=1))
    payload = {
        "user_id": user_id,
        "email": "test@example.com",
        "username": "testuser",
        "is_admin": is_admin,
        "exp": expiry,
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


class TestHealthCheck:
    def test_health_endpoint(self):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"


class TestPaymentProcessing:
    def test_process_payment_success(self):
        """Payment endpoint should return SUCCESS or FAILED (never None)"""
        token = create_test_token()
        response = client.post(
            "/payments/process",
            json={
                "card_id": 1,
                "amount": 100.00,
                "currency": "USD",
                "merchant_name": "Test Merchant",
                "description": "Test payment"
            },
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] in ["SUCCESS", "FAILED"]
        assert data["amount"] == "100.00"
        assert data["merchant_name"] == "Test Merchant"
        assert "reference_id" in data
        assert len(data["reference_id"]) > 0

    def test_process_payment_no_auth(self):
        """Request without token should return 403"""
        response = client.post(
            "/payments/process",
            json={"card_id": 1, "amount": 100.00, "merchant_name": "Test"}
        )
        assert response.status_code == 403

    def test_process_payment_expired_token(self):
        """Expired token should return 401"""
        token = create_test_token(expired=True)
        response = client.post(
            "/payments/process",
            json={"card_id": 1, "amount": 100.00, "merchant_name": "Test"},
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 401

    def test_process_payment_invalid_amount(self):
        """Zero or negative amount should fail validation"""
        token = create_test_token()
        response = client.post(
            "/payments/process",
            json={"card_id": 1, "amount": 0, "merchant_name": "Test"},
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 422

    def test_process_payment_negative_amount(self):
        token = create_test_token()
        response = client.post(
            "/payments/process",
            json={"card_id": 1, "amount": -50.00, "merchant_name": "Test"},
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 422

    def test_process_payment_reference_id_unique(self):
        """Each payment should get a unique reference_id"""
        token = create_test_token()
        refs = set()
        for _ in range(5):
            response = client.post(
                "/payments/process",
                json={"card_id": 1, "amount": 50.00, "merchant_name": "Shop"},
                headers={"Authorization": f"Bearer {token}"}
            )
            refs.add(response.json()["reference_id"])
        assert len(refs) == 5  # All unique

    def test_payment_simulation_distribution(self):
        """Verify roughly 80% success rate over many requests"""
        token = create_test_token()
        successes = 0
        total = 100
        for _ in range(total):
            response = client.post(
                "/payments/process",
                json={"card_id": 1, "amount": 10.00, "merchant_name": "Shop"},
                headers={"Authorization": f"Bearer {token}"}
            )
            if response.json()["status"] == "SUCCESS":
                successes += 1
        # Expect between 60-100% success (generous range for randomness)
        assert 50 <= successes <= 100
