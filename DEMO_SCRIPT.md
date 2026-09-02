# 🎬 MediSense BD — 10-Minute Official Client Video Demonstration Script

> **Target Audience:** Client / Stakeholders / Technical Evaluation Board  
> **Total Duration:** 10:00 (600 seconds)  
> **Presenter Tone:** Professional, confident, articulate, public-health focused  
> **Video Format:** 1080p or 4K Screen Recording with clear voiceover, smooth mouse movements, and browser dark mode  

---

## 📋 Pre-Recording Setup & Environment Checklist

Before hitting **Record**, follow these checklist steps to ensure a flawless demonstration:

1. **Local Server Status**: Ensure Docker containers (`docker compose up`) or local Node/FastAPI services are running smoothly.
2. **Browser Setup**: Open Chrome/Brave in **1920x1080** full-screen resolution. Clear browser storage (`localStorage.clear()`) or start from fresh sessions.
3. **Prepared Tabs / Windows**:
   - Tab 1: MediSense BD Web Interface (`http://localhost` or `http://<your-lan-ip>`)
   - Keep sample text, user passwords, and barcodes ready on a secondary screen or notepad for quick copy-pasting.
4. **Pre-Seeded Demo Credentials**:
   - **Admin Account**: `admin@medisense.bd` / `medisense2026` *(Male ♂)*
   - **Analyst Account**: `analyst@medisense.bd` / `medisense2026` *(Female ♀)*
   - **Female User**: `female@medisense.bd` / `password123` *(Female ♀)*
   - **Regular User**: `user@medisense.bd` / `password123` *(Male ♂)*
5. **Sample Data Cheat Sheet**:
   - **Bangla Symptoms Query**: `আমার ২ দিন ধরে তীব্র জ্বর, প্রচণ্ড মাথা ব্যথা, চোখের পেছনে ব্যথা এবং চামড়ায় লালচে র‍্যাশ দেখা দিয়েছে।`
   - **Valid DGDA Drug Barcode**: `8801016001018` *(Napa - Paracetamol 500mg)* or `8801045001013` *(Seclo - Omeprazole 20mg)*
   - **Counterfeit Test Barcode**: `8909876543210` *(Unregistered/Fake Batch)*
   - **Female Care Query**: `আমি মানসিক চাপে ভুগছি এবং গর্ভকালীন প্রজনন স্বাস্থ্য ও নিউট্রিশন সম্পর্কে পরামর্শ চাই।`

---

## 🕒 Video Timeline Summary

| Time | Segment Title | Primary Feature Highlight |
| :--- | :--- | :--- |
| **0:00 - 0:45** (45s) | **1. System Intro & Architecture Overview** | Platform Vision, Modern Tech Stack & Dark Glassmorphism UI |
| **0:45 - 1:45** (60s) | **2. Multi-Tier Auth & Gender-Aware UI** | Role Permissions & Dynamic Female Care Nav Item |
| **1:45 - 2:45** (60s) | **3. Mission Control Dashboard** | Real-Time Health KPIs, Epidemic Alerts & System Activity Feed |
| **2:45 - 4:15** (90s) | **4. Epidemic Forecasting & Outbreak Map** | 64-District Choropleth Map, LSTM Time-Series & ML Model Execution |
| **4:15 - 5:45** (90s) | **5. Healthcare Navigation & Dynamic SOS Polyline** | Haversine GPS Nearest Hospital Finder, Dynamic Emergency Polyline Routing & Health Equity Heatmap |
| **5:45 - 7:00** (75s) | **6. Bengali Symptom Triage, DGDA & Rx Export** | Bangla AI Urgency Classification, DGDA Drug Barcode Verification & Printable Rx Medical Prescription Export |
| **7:00 - 8:15** (75s) | **7. Dedicated Female Healthcare (`Nari Care AI`)** | Confidential Counselor, Mental Health Grounding & Maternal Nutrition |
| **8:15 - 9:15** (60s) | **8. Page-Wide AI Assistant & Formatting Engine** | Floating Launcher, Database/Web Retrieval, Table Engine & Shift+Enter Multiline Input |
| **9:15 - 9:45** (30s) | **9. System Activity Audit Console** | Admin Disk Log Explorer, Payload Inspector Drawer & Network Audit |
| **9:45 - 10:00** (15s) | **10. Conclusion & Deployment Readiness** | Docker Orchestration, LAN/Wi-Fi Access & Wrap-Up |

---

## 🎙️ Detailed Minute-by-Minute Script

---

### Segment 1: System Intro & Architecture Overview
⏱️ **Time:** `0:00` - `0:45` (45 seconds)

**🖥️ Visual / Action on Screen:**
- Start on the **MediSense BD Login Screen**.
- Display smooth mouse movement over the dark glassmorphic card elements and system logo.
- Transition to showing the architecture diagram (or brief landing view).

**🗣️ Voiceover Script:**
> *"Welcome, everyone. Today, I am thrilled to present **MediSense BD** — a unified national health intelligence and artificial intelligence platform specifically engineered to revolutionize public healthcare delivery across Bangladesh.*
> 
> *MediSense BD bridges critical healthcare gaps by combining **ML epidemic outbreak forecasting**, **interactive 64-district geospatial mapping**, **GPS emergency hospital navigation**, **DGDA drug authenticity verification**, **automated Bengali symptom triage**, **dedicated female healthcare counseling**, and an **integrated page-wide AI Assistant** into a modern, dark-glassmorphic enterprise application.*
> 
> *Architecturally, MediSense BD is containerized with Docker Compose, powered by Next.js 16 and React 19 on the client, an Express.js backend, a Python FastAPI Machine Learning inference pipeline, PostgreSQL 16 database, and Nginx reverse proxy routing. Let's log in and explore the core features."*

---

### Segment 2: Multi-Tier Authentication, Role Permissions & Gender-Aware UI
⏱️ **Time:** `0:45` - `1:45` (60 seconds)

**🖥️ Visual / Action on Screen:**
1. Type `user@medisense.bd` / `password123` and log in. Point out the sidebar navigation items. Show that **"Female Care AI"** is hidden for male regular users, and epidemic dataset upload is restricted (View-Only badge).
2. Log out, then log in as a female user: `female@medisense.bd` / `password123`.
3. Highlight the dynamic appearance of **"🌸 Female Care AI"** with its pink glassmorphic accent in the sidebar.
4. Log out and quickly showcase log in as Admin: `admin@medisense.bd` / `medisense2026`. Point out the full navigation unlock including **"🛡️ Audit Logs"**.

**🗣️ Voiceover Script:**
> *"Security and user-tailored access control are fundamental to MediSense BD. The platform features dynamic multi-tier authentication with granular role-based access control and gender-aware UI rendering.*
> 
> *When logged in as a Regular Male User, the interface operates in View-Only mode for predictions, and gender-specific modules remain hidden.*
> 
> *However, when logging in as a Female User — such as Ayesha Rahman — MediSense BD automatically detects user gender metadata and dynamically unlocks **Nari Care AI**, a specialized, confidential healthcare section in the main navigation.*
> 
> *Finally, logging in as an Analyst or Administrator unlocks complete system privileges, including dataset uploads, ML retraining execution, and raw server activity audit logs. All user sessions persist token authorization seamlessly."*

---

### Segment 3: Mission Control Dashboard (`/dashboard`)
⏱️ **Time:** `1:45` - `2:45` (60 seconds)

**🖥️ Visual / Action on Screen:**
- Navigate to `/dashboard` (**Mission Control**).
- Hover over the 3 interactive KPI Cards: **Active Outbreak Warnings**, **National Health Equity Index**, and **Counterfeit Detection Rate**.
- Scroll down to demonstrate the real-time **System Activity Feed** showing live outbreak alerts, verification stats, and emergency routing logs with glowing severity badges.

**🗣️ Voiceover Script:**
> *"Upon logging in, administrators and health officers land on **Mission Control** — the central dashboard for nationwide health intelligence.*
> 
> *At a glance, three real-time KPI metrics summarize critical national indicators: active epidemic warnings with 7-day predicted case volumes, the National Health Equity Index across measured Upazilas, and the current DGDA drug counterfeit detection percentage.*
> 
> *Below the KPIs, the live **Activity Feed** provides real-time situational awareness — alerting health authorities to high-risk Dengue warnings in Sylhet, hospital bed utilization spikes, and counterfeit drug interceptions in Gazipur. This ensures health department personnel can react instantly to emerging health emergencies."*

---

### Segment 4: Epidemic Forecasting & Outbreak Prediction (`/predict`)
⏱️ **Time:** `2:45` - `4:15` (90 seconds)

**🖥️ Visual / Action on Screen:**
1. Navigate to `/predict` (**Epidemic Forecasting**).
2. Show the **Choropleth Risk Map** of Bangladesh. Hover over high-risk red/amber district polygons (e.g., Sylhet, Chattogram, Dhaka).
3. Click on a high-risk district (e.g., **Sylhet** or **Dhaka**).
   - Show how clicking a district **automatically triggers the AI Chatbot drawer**, pre-loaded with an automated district outbreak and weather text summary!
   - Show the slide-over **District Details Drawer**: point out division, population, the **LSTM Time-Series Forecast Chart** (Recharts), and the weather forecast log table.
4. Click **"Upload Dataset"** button (`/predict/upload`). Drag-and-drop a sample CSV or show the clean upload UI.
5. Click **"⚡ Run Prediction"** button. Show the loading animation and success notification confirming Random Forest model retraining on temperature, humidity, rainfall, and seasonal features.
6. Click **"Download CSV"** button to show instant data export functionality.

**🗣️ Voiceover Script:**
> *"Now let's examine one of MediSense BD's most powerful capabilities: **Epidemic Outbreak Forecasting**.*
> 
> *Our backend machine learning engine — built with Scikit-Learn Random Forest Classifiers and time-series LSTM models — analyzes climatic variables including temperature, relative humidity, rainfall in millimeters, and seasonal cycles to forecast 7-day outbreak probabilities for Dengue, Diarrhea, Influenza, Typhoid, and Malaria.*
> 
> *On the interactive Choropleth Map, all 64 districts of Bangladesh are dynamically color-coded by risk severity. Notice what happens when I click on **Sylhet district**: the system instantly opens our page-wide AI Assistant pre-populated with a district health summary, while simultaneously sliding open an in-depth analytics drawer.*
> 
> *Here, healthcare analysts can view historical population metrics, interactive LSTM time-series forecast charts, and detailed weather logs.*
> 
> *Furthermore, Analysts can click **Upload Dataset** to ingest new field CSV data, hit **Run Prediction** to execute FastAPI model retraining in real time, or click **Download CSV** to export raw predictions for national policy reporting."*

---

### Segment 5: Healthcare Navigation & Dynamic SOS Routing (`/navigate`)
⏱️ **Time:** `4:15` - `5:45` (90 seconds)

**🖥️ Visual / Action on Screen:**
1. Navigate to `/navigate` (**Healthcare Navigation & SOS Routing**).
2. Click **"📍 Detect My GPS Location"**. Show how the map centers and fetches the nearest 24/7 emergency facilities.
3. Show the floating **Emergency Facilities Panel** listing the 5 nearest hospitals, total bed capacity, and available free beds.
4. **Click on a hospital name in the list** (e.g., *Dhaka Medical College Hospital* or *Chittagong Medical College Hospital*):
   - Watch the map dynamically draw a **glowing red-and-teal dashed emergency route Polyline** connecting user location directly to the hospital!
   - Highlight the **Active Route Info Overlay Card** showing precise distance in KM, estimated driving time, and the emergency call button.
5. Toggle the **"Show Health Equity Heatmap"** checkbox to overlay Upazila health equity circles measuring doctor-to-patient ratios and vaccine coverage.
6. Highlight the non-overlapping floating widgets: **SOS Emergency Button** stacked cleanly above the **AI Launcher**.

**🗣️ Voiceover Script:**
> *"In emergency situations, every second counts. MediSense BD includes an advanced **Healthcare Navigation & Geolocation SOS Routing Engine**.*
> 
> *By clicking **Detect My GPS Location**, the system executes a native PostgreSQL Haversine distance calculation to pinpoint the 5 closest 24/7 emergency facilities relative to the user's live latitude and longitude.*
> 
> *When I select a facility — such as **Dhaka Medical College Hospital** — the interactive Leaflet map instantly calculates and draws a glowing emergency road route Polyline directly from the user's location to the emergency ward entrance.*
> 
> *An active route card pops up displaying calculated distance in kilometers, real-time available bed counts, and a direct emergency contact call button.*
> 
> *Health officials can also toggle the **Health Equity Heatmap** to visualize doctor ratios, bed density, and vaccine coverage across rural Upazilas. Notice also that our floating SOS widget and AI assistant launcher are vertically stacked to prevent any UI overlap."*

---

### Segment 6: Bengali Symptom Triage, DGDA Drug Verification & Clinical Prescription Export (`/verify`)
⏱️ **Time:** `5:45` - `7:00` (75 seconds)

**🖥️ Visual / Action on Screen:**
1. Navigate to `/verify` (**Triage & Verification**).
2. In the **Bengali Symptom Triage Engine** (`TriageChat`), copy-paste or type a Bengali query:
   `আমার ২ দিন ধরে তীব্র জ্বর, প্রচণ্ড মাথা ব্যথা, চোখের পেছনে ব্যথা এবং চামড়ায় লালচে র‍্যাশ দেখা দিয়েছে।`
3. Click send. Show how the engine categorizes urgency (**CRITICAL / HIGH RISK** pill), evaluates potential Dengue symptoms via Groq LLM & BanglaBERT algorithms, and renders structured Bengali precautions in custom markdown.
4. Click **"📋 Export Clinical Report"** button:
   - Show the authentic **Medical Prescription (Rx)** popup modal featuring an official health letterhead header, Chief Complaints (C/O), Prescribed Medications & Management table (Rx), Lab Extractions, Safety Triage, and digital physician sign-off block.
   - Click **"Print / Save PDF"** to demonstrate clean window printing without scroll clipping.
5. Move to the **DGDA Drug Authenticity Scanner**:
   - Enter valid barcode: `8801016001018` -> click Verify. Show green **"VERIFIED AUTHENTIC"** card with manufacturer details (Beximco Paracetamol).
   - Enter suspicious barcode: `8909876543210` -> click Verify. Show prominent red **"COUNTERFEIT WARNING"** badge with confidence scoring.

**🗣️ Voiceover Script:**
> *"Next, let's explore **Triage & Drug Verification** on the `/verify` page.*
> 
> *First, our **Bengali Symptom Triage Engine** allows patients and field workers to input symptom complaints in natural Bangla script. When I submit symptoms describing high fever, severe headache, and rash — our Groq-powered AI engine combined with BanglaBERT immediately classifies the case as **CRITICAL**, warning of suspected Dengue and delivering immediate step-by-step guidance in Bangla.*
> 
> *By clicking **Export Clinical Report**, the conversation is instantly transformed into an official **Medical Prescription (Rx)** layout complete with clinical letterhead, Chief Complaints, Rx Medication table, diagnostic tests, and doctor signature block — ready for single-click PDF export or printing.*
> 
> *On the right, our **DGDA Drug Authenticity Scanner** validates pharmaceuticals against the Directorate General of Drug Administration database. Scanning barcode `8801016001018` verifies authentic **Napa 500mg** by Beximco. Conversely, scanning an unverified barcode triggers an instant **Counterfeit Warning**, protecting Bangladeshi citizens from substandard medicines."*

---

### Segment 7: Dedicated Female Healthcare (`Nari Care AI` - `/female-care`)
⏱️ **Time:** `7:00` - `8:15` (75 seconds)

**🖥️ Visual / Action on Screen:**
1. Navigate to `/female-care` (**Nari Care AI**).
2. Show the welcoming pink-accented glassmorphic theme and topic cards:
   - *Mental Health & Emotional Support*
   - *Reproductive & Maternal Health*
   - *Nutrition & Anemia Care*
   - *Work-Life & Mindful Balance*
3. Click on the **Mental Health & Emotional Support** topic card (or type: *"I am feeling very stressed and anxious lately. Can you give me grounding exercises?"*).
4. Demonstrate the empathetic Bangla/English counselor response, formatted with bullet points, bold highlights, and mental wellness grounding techniques.
5. Highlight that conversation history is **strictly user-isolated** in browser `localStorage` under `medisense_female_care_messages_u{userId}` so privacy is completely preserved across multiple users.

**🗣️ Voiceover Script:**
> *"Women's healthcare in Bangladesh often faces cultural barriers and privacy challenges. MediSense BD addresses this directly with **Nari Care AI** (`/female-care`) — a dedicated, confidential digital counselor.*
> 
> *Designed specifically for female users, Nari Care provides compassionate guidance across four core domains: Mental Health & Emotional Well-Being, Maternal & Reproductive Healthcare, Nutrition & Anemia Prevention using local Bangladeshi foods, and Mindful Work-Life Balance.*
> 
> *When a user asks for stress management support, Nari Care delivers empathetic, culturally attuned grounding exercises and psychological coping mechanisms.*
> 
> *Crucially, all Nari Care conversations are strictly isolated per logged-in user ID in secure local storage, ensuring complete privacy even when sharing devices in a family setting."*

---

### Segment 8: Page-Wide AI Chatbot Assistant & Markdown Engine
⏱️ **Time:** `8:15` - `9:15` (60 seconds)

**🖥️ Visual / Action on Screen:**
1. Click the floating **AI Assistant Launcher** widget (bottom right) from any page.
2. The global **AI Chatbot Drawer** slides open smoothly.
3. Type a query: `"Compare Dengue precautions and hospital bed availability in Dhaka vs Chittagong."`
4. Demonstrate multiline input: press `Shift + Enter` to create a new line, then press `Enter` to submit.
5. Inspect the generated response rendered by `FormattedMarkdown`:
   - Point out Setext/ATX headers with teal accent bars.
   - Point out **bold-only highlight styling** (no italics!).
   - Point out the **responsive HTML Data Table** comparing district stats side-by-side with hover effects.
   - Mention off-topic guardrails (e.g. asking about sports or coding gets politely redirected to public health).

**🗣️ Voiceover Script:**
> *"Accessible from every screen is our floating **Global AI Assistant**.*
> 
> *Powered by Groq Cloud LLM (`llama-3.3-70b-versatile`) with automatic fallback engines, the assistant answers queries by cross-referencing PostgreSQL database records and public health index citations.*
> 
> *Notice our auto-expanding multiline input box — pressing `Shift + Enter` inserts line breaks cleanly without accidental form submission.*
> 
> *Responses are rendered using our custom **FormattedMarkdown** engine. Notice the visual elegance: headers are accented with vertical teal bars, key terms enforce high-contrast bold highlights without ugly italics, and multi-district comparisons are presented in custom glassmorphic HTML data tables.*
> 
> *Furthermore, strict system prompt guardrails ensure the assistant stays focused exclusively on healthcare, politely declining off-topic queries."*

---

### Segment 9: System Activity Audit & Logs Explorer Console (`/audit`)
⏱️ **Time:** `9:15` - `9:45` (30 seconds)

**🖥️ Visual / Action on Screen:**
1. Navigate to `/audit` (**System Audit & Activity Logs**).
2. Show the summary overview cards: Total Disk Log Entries, Loaded Table Rows, Log File Path (`server/logs/activity_audit.log`).
3. Click through the filter tabs: **All Log Entries**, **🔌 HTTP API Calls**, **👁️ Page Visits**, **⚠️ Errors (4xx/5xx)**.
4. Click on any log table row to open the **Slide-Over Log Inspector Drawer**:
   - Show the full JSON Request & Response payload viewer, User-Agent header breakdown, client IP address, and execution latency in milliseconds.

**🗣️ Voiceover Script:**
> *"For system administrators, security and auditability are critical. Navigating to `/audit` opens the **System Activity Audit Console**.*
> 
> *Every HTTP API invocation, latency measurement, status code, request/response payload, client IP, and front-end page visit is recorded into a disk-persisted log file (`server/logs/activity_audit.log`).*
> 
> *Admins can filter by API calls, page visits, or error status codes, or search by IP and user email. Clicking any row opens our high-performance **Log Inspector Drawer**, offering complete payload transparency for debugging and security audits."*

---

### Segment 10: Conclusion & Deployment Readiness
⏱️ **Time:** `9:45` - `10:00` (15 seconds)

**🖥️ Visual / Action on Screen:**
- Return to the **Mission Control Dashboard** or main map view.
- Scroll down to highlight the minimal glassmorphic footer containing official links to the GitHub Repository, Profile, and Contact Email.

**🗣️ Voiceover Script:**
> *"In conclusion, **MediSense BD** delivers an end-to-end, state-of-the-art public health intelligence platform for Bangladesh — fully containerized, multi-device LAN ready, and deployment-proof.*
> 
> *Thank you for your time and evaluation. We look forward to delivering MediSense BD to transform public healthcare outcomes."*

---

## 🎯 Quick Recording Tips for Video Submission

1. **Mouse Pacing**: Move your mouse deliberately and smoothly. Avoid rapid erratic clicking.
2. **Audio Quality**: Use a decent condenser microphone or headset in a quiet room. Maintain an even speech pace (~130-140 words per minute).
3. **Screen Resolution**: Set display to **1920x1080 (100% DPI scale)** for optimal video rendering and text crispness.
4. **Resolution Verification**: Ensure high-contrast dark theme colors render clearly without compression artifacts.
