from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

app = FastAPI(
    title="RecoverAI Python ML Engine",
    description="Python ML scoring & prediction service for failed payment revenue recovery",
    version="1.0.0"
)

class PaymentPredictionInput(BaseModel):
    amount: float
    payment_method: str
    failure_reason: str
    attempt_number: int
    customer_ltv: float
    past_success_count: int
    past_failed_count: int

class PredictionOutput(BaseModel):
    recovery_probability: float
    confidence: float
    expected_recovery: float
    recommended_action: str
    delay_minutes: int
    signals: List[str]

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "RecoverAI Python ML Engine"}

@app.post("/predict", response_model=PredictionOutput)
def predict(data: PaymentPredictionInput):
    # Deterministic ML feature scoring algorithm in Python
    score = 0.50
    signals = []

    if data.payment_method.lower() == "upi":
        score += 0.12
        signals.append("UPI payment mode has high instant recovery probability")
    elif data.payment_method.lower() == "card":
        score += 0.05

    if data.failure_reason.lower() == "network_timeout":
        score += 0.22
        signals.append("Transient network issue quickly recoverable")
    elif data.failure_reason.lower() == "insufficient_funds":
        score += 0.10
        signals.append("Insufficient funds recoverable post salary/credit refresh")

    if data.past_success_count > 3:
        score += 0.15
        signals.append("Repeat customer with high historical completion rate")

    prob = min(max(round(score, 2), 0.05), 0.98)
    expected_rec = round(data.amount * prob, 2)

    action = "RETRY_LATER" if data.failure_reason.lower() == "insufficient_funds" else "RETRY_NOW"
    delay = 360 if action == "RETRY_LATER" else 0

    return PredictionOutput(
        recovery_probability=prob,
        confidence=0.91,
        expected_recovery=expected_rec,
        recommended_action=action,
        delay_minutes=delay,
        signals=signals
    )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
