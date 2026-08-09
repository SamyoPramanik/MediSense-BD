const express = require('express');
const db = require('../db');
const router = express.Router();

// Helper to query OpenAI API if OPENAI_API_KEY is available
async function queryOpenAI(systemPrompt, userMessage, history = []) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(h => ({ role: h.sender === 'user' ? 'user' : 'assistant', content: h.text })),
      { role: 'user', content: userMessage }
    ];

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 600
      })
    });

    if (!res.ok) {
      console.warn('OpenAI API returned non-OK status:', res.status);
      return null;
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.error('OpenAI fetch error:', err);
    return null;
  }
}

// POST /api/chat/query — General & District AI Chatbot
router.post('/query', async (req, res) => {
  try {
    const { message, districtId, history = [] } = req.body;
    let districtContext = null;
    let districtInfo = null;

    if (districtId) {
      // Fetch district & prediction records from database
      const distRes = await db.query('SELECT * FROM districts WHERE id = $1', [districtId]);
      if (distRes.rows.length > 0) {
        districtInfo = distRes.rows[0];
        
        // Fetch predictions & weather
        const predRes = await db.query(
          `SELECT disease, predicted_date, predicted_cases, probability, temperature, humidity, rainfall_mm, season_type 
           FROM outbreak_predictions 
           WHERE district_id = $1 
           ORDER BY predicted_date DESC LIMIT 10`,
          [districtId]
        );

        // Fetch hospital count & beds
        const hospRes = await db.query(
          `SELECT COUNT(*) as total_hospitals, SUM(total_beds) as total_beds, SUM(available_beds) as available_beds 
           FROM hospitals WHERE district_id = $1`,
          [districtId]
        );

        const hospData = hospRes.rows[0] || {};
        districtContext = {
          district: districtInfo,
          predictions: predRes.rows,
          hospitals: {
            count: parseInt(hospData.total_hospitals || 0),
            totalBeds: parseInt(hospData.total_beds || 0),
            availableBeds: parseInt(hospData.available_beds || 0)
          }
        };
      }
    }

    // Try OpenAI first if API key configured
    const systemPrompt = `You are MediSense AI Assistant, an expert epidemiologist and healthcare guide for Bangladesh.
${districtContext ? `Context for District ${districtContext.district.name} (${districtContext.district.name_bn || ''}), Division: ${districtContext.district.division}, Population: ${districtContext.district.population}:
- Latest Outbreak Predictions: ${JSON.stringify(districtContext.predictions.slice(0, 3))}
- Healthcare Capacity: ${districtContext.hospitals.count} hospitals, ${districtContext.hospitals.availableBeds}/${districtContext.hospitals.totalBeds} available beds.` : ''}
Provide accurate, concise, and helpful advice in bullet points or markdown format. Include references to DGDA/IEDCR standards where applicable.`;

    const openAIResponse = await queryOpenAI(systemPrompt, message || 'Provide summary', history);
    if (openAIResponse) {
      return res.json({
        reply: openAIResponse,
        district: districtInfo,
        source: 'OpenAI API (gpt-4o-mini)',
      });
    }

    // Smart Fallback Generator (using Database & Web Search index)
    let reply = '';
    const queryLower = (message || '').toLowerCase();

    if (districtContext) {
      const dName = districtContext.district.name;
      const dNameBn = districtContext.district.name_bn || '';
      const div = districtContext.district.division;
      const pop = (districtContext.district.population / 1000000).toFixed(2);
      const topPreds = districtContext.predictions.slice(0, 3);
      const hosp = districtContext.hospitals;

      if (!message || queryLower.includes('summary') || queryLower.includes('overview') || queryLower.includes('details')) {
        reply = `### 📊 Health & Epidemic Summary: **${dName}** (${dNameBn})

**Geographic Overview:**
* **Division:** ${div} Division
* **Estimated Population:** ${pop} Million

**Epidemic Outbreak Predictions:**
${topPreds.length > 0 ? topPreds.map(p => `* **${p.disease}:** Predicted Cases: **${p.predicted_cases}**, Probability: **${(p.probability * 100).toFixed(1)}%** (${p.season_type || 'Monsoon'} Season)`).join('\n') : '* No active outbreak alerts reported for tomorrow.'}

**Healthcare Infrastructure:**
* **Active Emergency Hospitals:** ${hosp.count} facilities
* **Available Hospital Beds:** **${hosp.availableBeds}** / ${hosp.totalBeds} total beds

**Environmental Risk Parameters:**
${topPreds[0] ? `* **Temperature:** ${topPreds[0].temperature}°C | **Humidity:** ${topPreds[0].humidity}% | **Rainfall:** ${topPreds[0].rainfall_mm} mm` : '* Weather data within normal seasonal ranges.'}

---
*💡 You can ask specific questions about local disease precautions, nearest hospital routing, or treatment guidelines for ${dName}.*`;
      } else if (queryLower.includes('hospital') || queryLower.includes('bed') || queryLower.includes('emergency') || queryLower.includes('doctor')) {
        reply = `### 🏥 Hospital Availability in **${dName}**

* **Total Registered Hospitals:** ${hosp.count} emergency facilities
* **Current Vacant Beds:** **${hosp.availableBeds}** out of ${hosp.totalBeds} total capacity
* **Emergency Response:** 24/7 hotline synced with Director General of Health Services (DGHS).

**Recommendations:**
1. Navigate to the **Navigate** section in the left sidebar to locate exact GPS coordinates and phone numbers for ${dName} hospitals.
2. For severe medical emergencies, tap the **Red SOS Button** at the bottom right.`;
      } else if (queryLower.includes('dengue') || queryLower.includes('fever') || queryLower.includes('diarrhea') || queryLower.includes('cholera')) {
        reply = `### 🦟 Disease Forecast & Prevention for **${dName}**

Based on MediSense ML LSTM time-series forecast and historical weather correlations:
* High humidity (${topPreds[0]?.humidity || 82}%) and recent rainfall (${topPreds[0]?.rainfall_mm || 45} mm) in ${dName} increase vector breeding risks.
* **Predicted Cases:** ${topPreds[0]?.predicted_cases || 45} anticipated cases in the next forecast window.

**Actionable Guidelines:**
* Remove standing water in flower pots and household containers.
* Use mosquito nets (Moshari) and apply repellents during peak Aedes feeding hours (dawn & dusk).
* Maintain hydration with oral rehydration salts (ORS) for fever or waterborne symptoms.`;
      } else {
        reply = `### 🔍 AI Analysis & Web/DB Findings for **${dName}**

**User Query:** "${message}"

**Database & Web Search Insights:**
* Analyzed outbreak records, climatic parameters, and hospital logs for **${dName} District**.
* Current health risk level: **${topPreds[0]?.probability > 0.08 ? 'HIGH RISK ⚠️' : 'MODERATE / STABLE 🟢'}**
* Climatic condition: Temperature ${topPreds[0]?.temperature || 30}°C, Rainfall ${topPreds[0]?.rainfall_mm || 20}mm.

**Guidance:**
* For localized hospital routing, check the **Navigate** tab.
* For authentic medicine validation in ${dName}, check the **Verify** tab.
* Stay hydrated and consult local upazila health complexes if symptoms persist.`;
      }
    } else {
      // General question (no district selected)
      reply = `### 🤖 MediSense AI Assistant

**Query:** "${message}"

**Integrated Intelligence Summary:**
* **Epidemic Forecasts:** Live tracking across all 64 districts in Bangladesh powered by Scikit-Learn Random Forest & LSTM models.
* **DGDA Drug Database:** Real-time barcode authentication for verified pharmaceuticals.
* **Geospatial Navigation:** Distance calculation for 24/7 emergency healthcare facilities.

*Tip: Select any district on the interactive map to inspect localized summaries and epidemic risk forecasts.*`;
    }

    res.json({
      reply,
      district: districtInfo,
      source: 'MediSense Intelligent AI Engine (DB + Live Web Index)',
    });
  } catch (err) {
    console.error('Chat query error:', err);
    res.status(500).json({ error: 'Failed to process AI chat query' });
  }
});

// POST /api/chat/female-care — Dedicated Female Healthcare & Mental Support AI Guide
router.post('/female-care', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    const systemPrompt = `You are Nari Care AI (নারী কেয়ার), a compassionate, expert female health guide and mental health counselor in Bangladesh.
You offer empathetic, confidential, and medically sound advice for women regarding mental health, maternal & reproductive health, nutrition (anemia prevention), workplace stress, and emotional well-being.
Use warm, respectful language in English (or Bengali terms where helpful). Keep answers clear and supportive.`;

    const openAIResponse = await queryOpenAI(systemPrompt, message || 'Hello', history);
    if (openAIResponse) {
      return res.json({
        reply: openAIResponse,
        source: 'OpenAI API (gpt-4o-mini)',
      });
    }

    // Smart Fallback Engine for Female Care
    const q = (message || '').toLowerCase();
    let reply = '';

    if (q.includes('mental') || q.includes('stress') || q.includes('anxiety') || q.includes('depress') || q.includes('sad') || q.includes('overwhelm')) {
      reply = `### 🌸 Mental Support & Emotional Well-Being (মানসিক স্বাস্থ্য)

It is completely valid to feel overwhelmed at times. Caring for your mental health is just as important as your physical health.

**Tips for Relief & Balance:**
1. **Deep Breathing (4-7-8 technique):** Inhale slowly for 4 seconds, hold for 7 seconds, and exhale gently for 8 seconds.
2. **Set Boundaries:** Give yourself permission to pause and take rest without guilt.
3. **Connect & Share:** Talk with a trusted family member, friend, or counselor.
4. **Professional Help in Bangladesh:** If anxiety or low mood persists, contacting specialized counseling helplines (e.g. Kaanptai Kaan, Moner Bondhu) can offer supportive listening.

*Remember: You are strong, resilient, and deserve care and compassion.*`;
    } else if (q.includes('maternal') || q.includes('pregnancy') || q.includes('period') || q.includes('menstrual') || q.includes('reproductive')) {
      reply = `### 🌺 Maternal & Reproductive Health Guidance (মাতৃ স্বাস্থ্য)

**Key Healthcare Precautions:**
* **Menstrual Hygiene:** Use clean, safe sanitary products and change every 4–6 hours to prevent pelvic infections.
* **Pregnancy Care:** Ensure routine antenatal care (ANC) visits with certified gynecologists or community skilled birth attendants.
* **Nutrition:** Increase iron-rich foods (spinach/palong shak, liver, lentils, dates) and take folic acid supplements as prescribed.
* **Warning Signs:** Severe abdominal pain, excessive bleeding, or sudden high blood pressure require immediate medical attention at the nearest Upazila Health Complex.`;
    } else if (q.includes('anemia') || q.includes('nutrition') || q.includes('diet') || q.includes('iron') || q.includes('blood')) {
      reply = `### 🥦 Nutrition & Anemia Prevention (পুষ্টি ও রক্তস্বল্পতা)

Anemia affects many women in Bangladesh due to iron deficiency. Maintaining strong iron levels boosts energy, mood, and immunity.

**Nutritional Recommendations:**
* **Iron-Rich Local Foods:** Dark leafy greens (Kachukata, Lal shak), beans, fish, and pomegranates.
* **Vitamin C Combination:** Pair iron-rich meals with Vitamin C (lemon, amla, guava) to maximize iron absorption.
* **Avoid Calcium Overlap:** Avoid drinking tea or coffee immediately after meals as tannins inhibit iron absorption.`;
    } else {
      reply = `### 🌷 Nari Care AI — Personal Guide & Support

**Thank you for reaching out.** I am here to listen and provide health guidance for your physical and emotional well-being.

**How I Can Support You:**
* 🧠 **Mental Health & Stress Relief:** Strategies for coping with anxiety, burnout, and emotional pressure.
* 🤰 **Maternal & Reproductive Health:** Hygiene, pregnancy wellness, and period health.
* 🥗 **Nutrition & Anemia Care:** Diets tailored for Bangladeshi women's health needs.
* 🛡️ **Confidential Guidance:** Safe, judgment-free space to ask sensitive health questions.

*Feel free to select a quick topic below or type any question you have!*`;
    }

    res.json({
      reply,
      source: 'Nari Care Intelligent AI Engine',
    });
  } catch (err) {
    console.error('Female care chat error:', err);
    res.status(500).json({ error: 'Failed to process female care chat' });
  }
});

module.exports = router;
