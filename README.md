# 🏥 MediSense BD — Unified Health Intelligence & AI Platform

**MediSense BD** is an integrated national health intelligence platform engineered for Bangladesh. It combines **ML epidemic forecasting**, **interactive geospatial disease mapping**, **healthcare navigation**, **DGDA drug authenticity verification**, **Bengali symptom triage**, **dedicated female healthcare & mental support**, and a **page-wide AI Chatbot** into a unified dark-glassmorphic application.

---

## 🌟 Key Features & Capabilities

### 1. 🔮 Epidemic Forecasting & Outbreak Prediction
* **ML Predictive Pipeline**: Driven by Scikit-Learn **Random Forest Classifier** and **LSTM** time-series forecasting models.
* **Climatic Feature Correlation**: Predicts disease probabilities (Dengue, Diarrhea, Influenza, Typhoid, Malaria) based on district temperature, humidity, rainfall (mm), and seasonal cycles.
* **Dataset Upload & Export**: Analysts and Admins can import CSV datasets to update outbreak models or export predictions.

### 2. 🗺️ Interactive Geospatial Outbreak Map & Auto AI Trigger
* **Dynamic Choropleth Map**: Built with React Leaflet, rendering color-coded risk markers across all 64 districts of Bangladesh.
* **District AI Trigger**: Clicking any district on the map automatically opens the AI Chatbot pre-loaded with a district text summary (cases, hospital capacity, weather risks).

### 3. 🤖 Page-Wide AI Chatbot Assistant
* **Floating Assistant**: Accessible on every page via a floating glassmorphic launcher.
* **Live Search & Database Retrieval**: Queries PostgreSQL database history and web search index citations to answer questions on local disease precautions, hospital bed availability, and treatment guidelines.
* **Universal Markdown & Table Formatting**: Custom styled parser (`FormattedMarkdown`) rendering headers (H1-H6 & Setext `==`/`--`) with theme-matched colors (`text-teal-300` / `text-pink-300`) and vertical accent bars. Enforces **bold** (`style={{ fontWeight: 800 }}`) with theme highlights (`text-teal-200` / `text-pink-200`) for all asterisk/underscore delimiters (`*`, `**`, `***`, `_`, `__`, `___`), eliminating italics. Supports sub-bullet indentation, strikethrough, code blocks, lists, badges, and responsive tables.
* **Multiline Input & Shift+Enter Newlines**: Auto-expanding chat textareas in system-wide AI and Nari Care AI allow `Shift + Enter` to insert newlines without submitting, while `Enter` alone submits the prompt.




* **Multi-Device Local Wi-Fi / LAN Access**: Configured relative API routing (`API_BASE = '/api'`) and Docker build arguments (`ARG NEXT_PUBLIC_API_URL=/api`), allowing mobile phones, tablets, and secondary devices on the same Wi-Fi network to access `http://<your-ip>` without experiencing CORS or `Failed to fetch` connection errors.
* **User-Isolated LocalStorage Persistence**: Chat message history and active district context are dynamically scoped to the logged-in user ID (`medisense_chat_messages_u${user.id}`). Different users logging into the same browser cannot access or view another user's chat history.

* **OpenAI & Groq Cloud AI Drop-In Ready**: Supports `GROQ_API_KEY` (`llama-3.3-70b-versatile`) for ultra-fast response generation, `OPENAI_API_KEY` (`gpt-4o-mini`), and built-in MediSense fallback engine.
* **High-Capacity Non-Truncated Output**: Configured LLM token limits (`max_tokens: 8000`) and automatic syntax repair in `FormattedMarkdown` so long responses, multi-district tables, and medical recommendations complete cleanly without cutting off midway.
* **Robust Off-Topic Guardrails**: System prompts across all chatbots strictly enforce domain boundaries, politely refusing unrelated topics (coding, sports, finance, entertainment) while directing users to medical & public health guidance.


### 10. 🌐 Minimal Glassmorphic Footer Links
* **Source Code Repository Logo**: [MediSense-BD Repository](https://github.com/SamyoPramanik/MediSense-BD)
* **GitHub Profile Logo**: [Samyo Pramanik GitHub Profile](https://github.com/SamyoPramanik)
* **Contact Email Logo**: [samyopramanik2003@gmail.com](mailto:samyopramanik2003@gmail.com)








### 4. 🌸 Dedicated Female Healthcare & Mental Support (`Nari Care AI`)
* **Gender-Aware UI**: Dynamically reveals the **"Female Care AI"** nav item in the sidebar for female users.
* **Nari Care Counselor**: Dedicated page (`/female-care`) offering confidential counselor guidance for women in Bangladesh:
  - 🧠 **Mental Health & Emotional Support**: Stress management, postpartum blues, anxiety relief, emotional grounding.
  - 🌺 **Maternal & Reproductive Healthcare**: Period hygiene, pregnancy milestones, warning signs.
  - 🥗 **Nutrition & Anemia Prevention**: Iron-rich local Bangladeshi food guidance.
  - 🛡️ **Work-Life & Mindful Balance**: Confidential self-care advice.

### 5. 🏥 Emergency Healthcare Navigation & GPS Routing
* **Nearest Hospital Finder**: Uses native PostgreSQL Haversine distance calculations to locate the 5 nearest 24/7 emergency facilities relative to user GPS coordinates.
* **Interactive Hospital Route Drawing**: Clicking any hospital name in the emergency list or map marker draws a glowing red/teal dashed emergency route Polyline connecting your location to that hospital, auto-zooming the map and displaying an active route info card with distance in KM, available beds, and emergency call button.
* **Bed Capacity Tracking**: Real-time visibility into total vs available hospital beds.
* **Upazila Health Equity Index**: Heatmaps measuring doctor ratios, bed ratios, and vaccine coverage.
* **Non-Overlapping Floating Action Widgets**: Vertically stacked floating SOS Emergency button (`bottom-36 right-6`) and AI Health Assistant launcher (`bottom-20 right-6`) to ensure full accessibility without blocking the footer icons.


### 6. 💊 DGDA Drug Authenticity Verification
* **Barcode Reader & Search**: Validates pharmaceuticals against the Directorate General of Drug Administration (DGDA) registry.
* **Counterfeit Interception**: Flags counterfeit/suspicious batches and displays authentic confidence scores.

### 7. 🩺 Automated Bengali Symptom Triage
* **Bengali AI Triage Engine**: Accepts Bengali symptom queries (e.g., `'শ্বাসকষ্ট'`, `'জ্বর'`), categorizes urgency (`low`, `moderate`, `critical`), and generates rich medical guidance powered by Groq LLM & BanglaBERT algorithms.
* **Persistent Markdown UI & Scrollbar**: Features custom styled markdown rendering (`FormattedMarkdown`), fixed container height (`h-[520px]`), smooth custom scrollbar, color-coded risk pills, and browser `localStorage` conversation history with reset controls.

### 8. 🔐 Multi-Tier Auth & Role Access Control
* **User Sign Up & Sign In**: Supports user registration with Email, Password, Full Name, and Gender (`female`, `male`, `other`).
* **Role Permissions**:
  - 👁️ **Regular Users**: Read-only access to forecasts, maps, search, navigation, and chatbots. Dataset upload & model retraining are restricted.
  - 🛡️ **Analysts & Admins**: Full access including CSV dataset upload and ML model training execution.

* **Disk-Persisted Log File**: Captures every API request, response status, execution latency, request payload, response payload, client IP, User-Agent, and user identity into `server/logs/activity_audit.log`. Requests to `/api/audit/*` and visits to `/audit` are automatically excluded to prevent recursive log feedback loops.
* **Page Visit Tracking**: Automatically tracks front-end page navigations (`/dashboard`, `/predict`, `/navigate`, `/verify`, `/female-care`, `/audit`) via Next.js `ActivityTracker`.
* **Admin-Only Access**: Log viewing endpoints (`/api/audit/logs`) and the sidebar navigation item (`/audit`) are strictly restricted to Administrator accounts (`role === 'admin'`).
* **Lightweight Table & Dual Payload Inspector Drawer**: Renders a high-performance, lightweight HTML table (`<table>`) without transferring heavy payload strings. Clicking any row triggers an on-demand detail fetch (`GET /api/audit/logs/:id`) opening a slide-over Log Inspector Drawer with full JSON Request & Response payload viewers, User-Agent headers, and error tracebacks.





---

## 🛠️ Technology Stack

| Layer | Technology / Framework |
| :--- | :--- |
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Framer Motion, Recharts, React Leaflet |
| **Backend API** | Node.js, Express.js, JWT Authentication, `bcryptjs`, `pg` |
| **ML & AI Service** | Python 3.11, FastAPI, Uvicorn, Scikit-Learn, Pandas, NumPy, Joblib |
| **Database** | PostgreSQL 16 (Alpine) |
| **Reverse Proxy** | Nginx |
| **Containerization** | Docker, Docker Compose |

---

## 🚀 Quick Setup & Deployment

### Prerequisites
* [Docker Desktop](https://www.docker.com/) & `docker compose` installed.

### Run with Docker Compose
1. Clone the repository and navigate into the directory:
   ```bash
   cd MediSense
   ```
2. Start the entire containerized stack:
   ```bash
   docker compose up --build
   ```
3. Open your browser and navigate to:
   ```
   http://localhost
   ```

---

## 🔑 Quick Demo Login Credentials

You can test different user roles and gender-aware features using the pre-seeded demo accounts:

| Role | Gender | Email | Password | Unlocked Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Female User** | Female ♀ | `female@medisense.bd` | `password123` | Female Care AI in Navbar, AI Chatbot, Maps & Predictions (View-Only) |
| **Regular User** | Male ♂ | `user@medisense.bd` | `password123` | AI Chatbot, Maps & Predictions (View-Only), Navigation, Verification |
| **Analyst** | Female ♀ | `analyst@medisense.bd` | `medisense2026` | Dataset Upload, Model Retraining, Female Care AI, All Features |
| **Admin** | Male ♂ | `admin@medisense.bd` | `medisense2026` | Full System Administration, Dataset Upload, Model Retraining |

---

## ⚙️ Environment Variables

The application operates out-of-the-box with default values. Optional environment variables can be set in `server/.env` or `docker-compose.yml`:

```env
# Server Envs
PORT=3000
JWT_SECRET=medisense-secret-key-2026
DB_URL=postgres://medisense:medisense2026@database:5432/medisense
GROQ_API_KEY=your_groq_api_key_here    # Ultra-fast Groq LLM (llama-3.3-70b-versatile)
OPENAI_API_KEY=your_openai_api_key_here  # Optional: OpenAI (gpt-4o-mini)


# Client Envs
NEXT_PUBLIC_API_URL=http://localhost/api
```

---

## 📁 Repository Architecture

```
MediSense/
├── client/                 # Next.js 16 Frontend App Router
│   ├── src/app/            # Protected & public routes ((protected)/female-care, predict, navigate, verify)
│   ├── src/components/     # UI, Auth, Layout, AI Chatbot (GlobalAiChatbot, FormattedMarkdown)
│   └── src/hooks/          # Custom hooks (useAuth, ChatContext)
├── server/                 # Express.js Backend API
│   └── routes/             # auth.js, chat.js, predict.js, navigate.js, verify.js, search.js
├── ai/                     # Python FastAPI Machine Learning Inference Service
│   └── outbreak_prediction.py # Random Forest model pipeline
├── db/                     # PostgreSQL database init.sql schema & seed data
├── nginx/                  # Nginx reverse proxy configuration
├── docker-compose.yml      # Multi-container orchestration config
└── README.md               # Project documentation
```

---

## 📄 License
Developed for Bangladesh Public Healthcare & Epidemic Intelligence.
