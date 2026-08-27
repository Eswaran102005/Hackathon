# RecoverAI System Architecture

RecoverAI is built as a multi-tier autonomous AI Revenue Recovery Agent designed for merchants processing online payments.

```
                MERCHANT / DEMO USER
                         |
                         v
                React Dashboard (Vite)
                         |
                         | REST API
                         v
              Node.js / Express API
                         |
       +-----------------+-----------------+
       |                 |                 |
       v                 v                 v
Payment Service     AI Service      Recovery Service
(Mock Provider)   (Scoring/Model)   (Strategy Engine)
       |                 |                 |
       v                 v                 v
  Ingest Webhook    AI Prediction    Strategy Engine
                         |                 |
                +--------+--------+        v
                |                 |  Guardrails Check
                v                 v        |
          Expected Yield   LLM Explanation v
          Calculations     (Gemini API)   Recovery Action
                |                 |        |
                +--------+--------+        v
                         |           Event Stream
                         v                 |
                    PostgreSQL / SQLite Storage
```

## System Components

### 1. Frontend Interface (`frontend/`)
- Built with React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, and Recharts.
- Provides real-time merchant analytics, failed payments directory, detailed prediction breakdown, AI activity stream, strategy analytics, and What-If simulator.

### 2. Core Backend API Service (`backend/`)
- Built with Express, TypeScript, Prisma ORM.
- Handles authentication, dashboard metric aggregations, payment state machine, action scheduling, and event logging.

### 3. AI Scoring & Feature Engineering (`backend/src/services/aiScoringService.ts`)
- Evaluates 8 transaction and customer signals: payment method, failure reason, transaction amount, attempt number, customer past success count, past recovery history, customer LTV, and time of transaction.
- Computes deterministic Recovery Probability ($0.05 \le P \le 0.98$) and Expected Recovery Yield ($\text{Amount} \times P$).

### 4. Deterministic Strategy Engine & Guardrails (`backend/src/services/strategyEngine.ts`)
- Computes Expected Value for candidate strategies:
  $$\text{EV} = (\text{Amount} \times P_{\text{recovery}} \times P_{\text{action\_success}}) - \text{Cost}_{\text{action}}$$
- Enforces strict safety guardrails:
  - Max retry count limit (3 attempts max).
  - Very low probability ($P < 0.15$) $\rightarrow$ `NO_ACTION`.
  - High value transaction ($\ge \text{₹25,000}$) with bank decline $\rightarrow$ `MANUAL_REVIEW`.

### 5. LLM Integration & Fallback Service (`backend/src/services/geminiService.ts`)
- Uses Google Gemini API (`gemini-2.5-flash`) for natural-language explanations and personalized communications across Email, WhatsApp, and SMS.
- Seamless fallback engine ensures 100% demo uptime even without API keys.
