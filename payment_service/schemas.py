from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal


class PaymentRequest(BaseModel):
    card_id: int = Field(..., description="ID of the saved card to charge")
    amount: Decimal = Field(..., gt=0, description="Payment amount (must be > 0)")
    currency: str = Field(default="USD", max_length=3)
    merchant_name: str = Field(..., max_length=200)
    description: Optional[str] = Field(default="", max_length=500)

    class Config:
        json_schema_extra = {
            "example": {
                "card_id": 1,
                "amount": 150.00,
                "currency": "USD",
                "merchant_name": "Amazon",
                "description": "Online purchase"
            }
        }


class PaymentResponse(BaseModel):
    reference_id: str
    status: str  # PENDING | SUCCESS | FAILED
    amount: Decimal
    currency: str
    merchant_name: str
    failure_reason: Optional[str] = ""
    processed_at: str
    card_id: int
    user_id: str


class PaymentStatusUpdate(BaseModel):
    reference_id: str
    status: str
    failure_reason: Optional[str] = ""
