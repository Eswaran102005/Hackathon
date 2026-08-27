# RecoverAI REST API Documentation

All API responses follow the standard JSON response format:

**Success Response:**
```json
{
  "success": true,
  "data": {}
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

---

## Auth Endpoints

### POST `/api/auth/register`
Registers a new merchant account.

### POST `/api/auth/login`
Authenticates a merchant and returns JWT token.

---

## Dashboard Endpoints

### GET `/api/dashboard/summary`
Returns KPI metrics (Total Revenue, Revenue At Risk, Recoverable Revenue, Simulated Recovered Revenue, Recovery Rate, Failed Payments count, AI Insights).

### GET `/api/dashboard/revenue`
Returns 14-day revenue trend timeline data.

### GET `/api/dashboard/failure-breakdown`
Returns failed payments breakdown by failure reason.

---

## Payment Endpoints

### GET `/api/payments`
Lists payments with pagination, status filter, paymentMethod filter, failureReason filter, and search.

### GET `/api/payments/:id`
Returns payment detail, customer history, prediction history, actions, events, and AI messages.

### POST `/api/payments/:id/retry`
Triggers simulated recovery execution for a failed payment.

---

## AI & Recovery Endpoints

### POST `/api/ai/predict/:paymentId`
Runs feature scoring algorithm and strategy engine for specified payment.

### POST `/api/ai/generate-message/:paymentId`
Generates personalized recovery communication (Email, WhatsApp, SMS) via Gemini LLM.

### GET `/api/recovery`
Returns list of recovery actions and live event stream.

---

## Webhook & Simulator Endpoints

### POST `/api/webhooks/payment`
Processes incoming payment failure webhooks.

### POST `/api/simulator/run`
Computes What-If strategy comparisons and potential revenue uplift.

### POST `/api/demo/simulate-failure`
Triggers pitch flow scenario (creates ₹5,000 card transaction failure).
