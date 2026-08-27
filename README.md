# 🚀 RecoverAI — AI-Powered Revenue Recovery Agent for Failed Payments

> **“RecoverAI turns failed payments into recoverable revenue by predicting recovery probability, selecting the best recovery action, and measuring the resulting impact.”**

---

## 📌 Problem

Online merchants lose up to **10%–15% of total revenue** due to failed payment attempts (insufficient funds, bank declines, network timeouts, OTP drop-offs). Most payment dashboards only answer: *"Which payments failed?"* Merchants are left guessing which failures are recoverable, when to retry them, and what communication channel to use without annoying the customer.

## 💡 Solution

**RecoverAI** is an autonomous AI agent that ingests failed payment webhooks, runs feature engineering and deterministic ML scoring, evaluates expected recovery value across candidate strategies, generates personalized communications via Google Gemini LLM, and automatically schedules recovery actions.

---

## ✨ Features

- **📊 Revenue Intelligence Dashboard**: Real-time KPI cards (Total Revenue, Revenue At Risk, Recoverable Revenue, Simulated Recovered Revenue, Recovery Rate), Recharts trend graphs, and AI Insights.
- **🤖 Autonomous AI Scoring Engine**: Deterministic ML feature scoring computing Recovery Probability ($0.05 \le P \le 0.98$) and Expected Recovery Yield.
- **⚖️ Strategy Engine & Guardrails**: Expected Value strategy optimization (`RETRY_NOW`, `RETRY_LATER`, `WHATSAPP`, `EMAIL`, `PAYMENT_LINK`, `MANUAL_REVIEW`, `NO_ACTION`) with strict safety guardrails.
- **💬 Gemini LLM Communications**: Generates personalized natural language recovery explanations and contextual WhatsApp/Email/SMS messages with instant copy controls.
- **⚡ 5-Minute Pitch Flow Simulator**: Instant demo button creating a ₹5,000 card payment failure, scoring 87% recovery probability, recommending a 6-hour delayed retry, generating AI explanation, approving recovery, and updating live revenue metrics.
- **🎛️ What-If Strategy Simulator**: Interactive parameter sliders (failed volume, failed revenue exposure, retry delays, nudge channels) computing real-time yield uplift curves.
- **🔌 Webhook Sandbox**: Endpoint tester for `POST /api/webhooks/payment` simulating external payment gateway failure events.

---

## 🏗️ Architecture

```
                MERCHANT
                   |
                   v
            React Dashboard (Vite)
                   |
                   | REST API
                   v
          Node.js / Express API
                   |
    +--------------+--------------+
    |              |              |
    v              v              v
Payment Service  AI Service   Recovery Service
    |              |              |
    v              v              v
  Webhook      AI Scoring   Strategy Engine
    |          Pipeline           |
    v              |              v
  Storage          v          Guardrails
  (Prisma)     Gemini LLM         |
                   |              v
                   +------> Action Schedule & Event Log
```

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, SQLite / PostgreSQL
- **AI / LLM**: Google Gemini API (`@google/genai` with deterministic fallback engine)
- **Python ML Engine**: Python FastAPI, scikit-learn (`ai-engine/main.py`)

---

## ⚡ Quick Start & Local Execution

### 1. Install Monorepo Dependencies & Setup Database

```bash
# Clone the repository
git clone https://github.com/your-username/recoverai.git
cd Hackathon

# Install backend & frontend packages, generate Prisma schema, and seed 500+ records
npm run setup
```

### 2. Environment Setup

Create `.env` inside `backend/` or root based on `.env.example`:

```env
DATABASE_URL="file:./dev.db"
PORT=5000
NODE_ENV=development
JWT_SECRET=recoverai_super_secret_jwt_key_2026
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run Development Servers

```bash
# Start both backend (http://localhost:5000) and frontend (http://localhost:5173) concurrently
npm run dev
```

Open your browser to **`http://localhost:5173`**.

---

## 🔑 Demo Credentials

- **Email**: `demo@recoverai.io`
- **Password**: `demo1234`
- *(Note: Sandbox mode allows instant access without auth friction for hackathon judges)*

---

## 🎯 5-Minute Hackathon Pitch Flow

1. **0:00–0:30 (Problem)**: Open dashboard showing revenue leakage caused by failed payments.
2. **0:30–1:00 (Solution)**: Explain RecoverAI recovery probability prediction and optimal action selection.
3. **1:00–2:30 (Live Demo)**: Click **"Simulate Payment Failure"** in the top header.
   - ₹5,000 card transaction failure appears.
   - AI calculates **87% Recovery Probability**.
   - Recommends **"Retry after 6 hours"** with **₹4,350 Expected Yield**.
   - Gemini generates AI explanation.
   - Click **"Approve Recovery"** $\rightarrow$ Status changes to `RECOVERED` $\rightarrow$ Simulated revenue increases by **+₹5,000**.
4. **2:30–3:30 (AI Pipeline)**: Show AI Command Center event stream and Gemini communication generator.
5. **3:30–4:15 (What-If Simulator)**: Demonstrate parameter sliders showing +₹42,000 yield uplift.
6. **4:15–5:00 (Closing)**: *"RecoverAI turns failed payments into recoverable revenue."*

---

## 🛠️ What Broke & How We Solved It

- **Issue**: During Prisma SQLite setup with Node.js ES Modules (`"type": "module"`), native module resolution caused path aliasing issues when seeding TypeScript files via `ts-node`.
- **Solution**: Standardized relative module imports with explicit `.js` extensions in TypeScript source files, enabling seamless execution across both Node.js development mode and production TypeScript builds.

---

## 📊 Benchmark Results

> *Note: All metrics below are simulated results using realistic synthetic payment data generated for Nova Retail India Pvt Ltd.*

- **Total Processed Volume**: 520 Payments
- **Failed Payment Scenarios**: 220 Payments
- **Simulated Recovery Rate**: 38.4%
- **Simulated Recovered Revenue**: ₹1,84,000+

---

## 🔮 Future Improvements

- Real-time Razorpay/Stripe production webhook listeners.
- Merchant-specific reinforcement learning (RL) retry optimization.
- Multi-channel automated messaging integrations (WhatsApp Business API, Twilio).
- Deep fraud detection cross-referencing payment failure signals.
# Hackathon
