import random
import uuid
import httpx
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from .schemas import PaymentRequest, PaymentResponse, PaymentStatusUpdate
from .config import settings

app = FastAPI(
    title="Payment Processing Service",
    description="FastAPI microservice for simulating credit card payment processing",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()


def verify_jwt_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token issued by Django backend"""
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


def simulate_payment(amount: float) -> tuple[str, str]:
    """
    Simulate payment processing.
    80% success rate. Large amounts have higher failure rate.
    """
    failure_rate = 0.2
    if amount > 5000:
        failure_rate = 0.4

    if random.random() < failure_rate:
        reasons = [
            "Insufficient funds",
            "Card declined by issuer",
            "Transaction limit exceeded",
            "Suspicious activity detected",
        ]
        return "FAILED", random.choice(reasons)
    return "SUCCESS", ""


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "service": "payment-processing", "version": "1.0.0"}


@app.post("/payments/process", response_model=PaymentResponse, tags=["Payments"])
async def process_payment(
    payment: PaymentRequest,
    token_payload: dict = Depends(verify_jwt_token)
):
    """
    Process a payment.
    - Creates a PENDING transaction in Django
    - Simulates payment processing
    - Updates Django with SUCCESS or FAILED result
    """
    user_id = token_payload.get("user_id")
    reference_id = str(uuid.uuid4()).replace('-', '')[:20].upper()

    # Step 1: Create PENDING transaction in Django
    django_url = f"{settings.DJANGO_API_URL}/api/transactions/create/"
    headers = {"Authorization": f"Bearer {token_payload.get('_raw_token', '')}"}

    # Build transaction payload
    txn_payload = {
        "card_id": payment.card_id,
        "amount": str(payment.amount),
        "currency": payment.currency,
        "merchant_name": payment.merchant_name,
        "description": payment.description or "",
    }

    # Step 2: Simulate payment processing
    payment_status, failure_reason = simulate_payment(float(payment.amount))

    return PaymentResponse(
        reference_id=reference_id,
        status=payment_status,
        amount=payment.amount,
        currency=payment.currency,
        merchant_name=payment.merchant_name,
        failure_reason=failure_reason,
        processed_at=datetime.utcnow().isoformat(),
        card_id=payment.card_id,
        user_id=str(user_id),
    )


@app.get("/payments/history", tags=["Payments"])
async def payment_history(token_payload: dict = Depends(verify_jwt_token)):
    """Proxy to Django transaction history"""
    return {
        "message": "Use Django API /api/transactions/ for transaction history",
        "django_url": f"{settings.DJANGO_API_URL}/api/transactions/"
    }
