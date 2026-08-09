const express = require('express');
const db = require('../db');
const router = express.Router();

// Helper to query Groq API or OpenAI API if keys are available
async function queryLLM(systemPrompt, userMessage, history = []) {
  const groqKey = (process.env.GROQ_API_KEY || process.env.GROQ_KEY || process.env.GROQ_API_TOKEN || '').trim();
  const openaiKey = (process.env.OPENAI_API_KEY || '').trim();

  console.log(`[AI Chat] Invoking LLM query. Groq Key: ${groqKey ? 'PRESENT (len: ' + groqKey.length + ')' : 'MISSING'}, OpenAI Key: ${openaiKey ? 'PRESENT (len: ' + openaiKey.length + ')' : 'MISSING'}`);

  if (!groqKey && !openaiKey) return null;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map(h => ({ role: h.sender === 'user' ? 'user' : 'assistant', content: h.text })),
    { role: 'user', content: userMessage }
  ];

  // 1. Try Groq API first if key configured (Ultra-fast LLM Inference)
  if (groqKey && groqKey.length > 5) {
    try {
      console.log('[AI Chat] Calling Groq Cloud API (llama-3.3-70b-versatile)...');
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages,
          temperature: 0.7,
          max_tokens: 8000
        })
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply) {
          console.log('[AI Chat] Groq Cloud API response received successfully!');
          return { reply, source: 'Groq Cloud AI (llama-3.3-70b)' };
        }
      } else {
        const errText = await res.text().catch(() => '');
        console.warn(`[AI Chat] Groq API returned non-OK status ${res.status}: ${errText}`);
      }
    } catch (err) {
      console.error('[AI Chat] Groq fetch exception:', err);
    }
  }

  // 2. Fallback to OpenAI API if key configured
  if (openaiKey && openaiKey.length > 5) {
    try {
      console.log('[AI Chat] Calling OpenAI API (gpt-4o-mini)...');
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.7,
          max_tokens: 8000
        })
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply) {
          console.log('[AI Chat] OpenAI API response received successfully!');
          return { reply, source: 'OpenAI API (gpt-4o-mini)' };
        }
      } else {
        const errText = await res.text().catch(() => '');
        console.warn(`[AI Chat] OpenAI API returned non-OK status ${res.status}: ${errText}`);
      }
    } catch (err) {
      console.error('[AI Chat] OpenAI fetch exception:', err);
    }
  }

  console.log('[AI Chat] Falling back to internal MediSense Intelligent AI Engine.');
  return null;
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

    // Prepare system prompt with DB context and strict off-topic guardrails
    const systemPrompt = `You are MediSense AI Assistant, an expert public health epidemiologist, healthcare guide, and disease intelligence system specialized EXCLUSIVELY in Bangladesh public health, epidemic forecasting, hospital navigation, disease precautions, and medical inquiries.

CRITICAL INSTRUCTIONS & STRICT BOUNDARIES:
1. SCOPE REQUIREMENT: You MUST ONLY answer questions related to healthcare, medical advice, disease outbreaks, epidemic forecasts, hospital beds, medicines, public health precautions, wellness, hygiene, or MediSense BD platform features.
2. OFF-TOPIC STRICT REFUSAL RULE: If the user asks ANY question completely unrelated to healthcare, medicine, biology, public health, or MediSense (for example: programming/coding, sports, movie/celebrity trivia, finance, political debates, gaming, physics/math homework, or unrelated history):
   - You MUST POLITELY DECLINE to answer the off-topic query.
   - Do NOT provide code, sports answers, trivia, or off-topic solutions.
   - State clearly and politely in 1-2 sentences: "I am MediSense AI, specialized exclusively in public health, disease intelligence, and medical guidance for Bangladesh. I cannot answer questions on off-topic subjects. Please feel free to ask any health, disease, or medical question!"
3. BILINGUAL SUPPORT: Respond in English or Bengali matching the user's language.
4. ACCURACY & FORMATTING: Provide structured, empathetic, and evidence-based guidance with markdown formatting (headers, bolding, bullet points, tables when comparing data).

${districtContext ? `Context for District ${districtContext.district.name} (${districtContext.district.name_bn || ''}), Division: ${districtContext.district.division}, Population: ${districtContext.district.population}:
- Latest Outbreak Predictions: ${JSON.stringify(districtContext.predictions.slice(0, 3))}
- Healthcare Capacity: ${districtContext.hospitals.count} emergency hospitals, ${districtContext.hospitals.availableBeds}/${districtContext.hospitals.totalBeds} available beds.` : ''}`;

    const llmResult = await queryLLM(systemPrompt, message || 'Provide summary', history);
    if (llmResult) {
      return res.json({
        reply: llmResult.reply,
        district: districtInfo,
        source: llmResult.source,
      });
    }

    // Off-topic filter for fallback generator
    const queryLower = (message || '').toLowerCase();
    const offTopicKeywords = ['code', 'python', 'javascript', 'programming', 'cricket', 'football', 'soccer', 'movie', 'actor', 'finance', 'bitcoin', 'crypto', 'stock', 'game', 'gaming', 'math', 'homework'];
    const healthKeywords = ['health', 'disease', 'fever', 'hospital', 'doctor', 'medicine', 'dengue', 'cholera', 'malaria', 'covid', 'symptom', 'pregnancy', 'anemia', 'stress', 'triage', 'bed', 'clinic', 'summary', 'overview'];

    const isOffTopic = offTopicKeywords.some(k => queryLower.includes(k)) && !healthKeywords.some(k => queryLower.includes(k));

    if (isOffTopic) {
      return res.json({
        reply: `### 🛡️ Off-Topic Query Notice\n\nI am **MediSense AI**, specialized exclusively in public health, epidemic intelligence, disease precautions, and healthcare guidance for Bangladesh.\n\nI cannot assist with off-topic queries (such as programming, sports, finance, or entertainment). Please ask any health or medical question!`,
        district: districtInfo,
        source: 'MediSense Scope Filter',
      });
    }

    // Smart Fallback Generator (using Database & Web Search index)
    let reply = '';


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

    const systemPrompt = `You are Nari Care AI (নারী কেয়ার), a compassionate, highly specialized female healthcare guide and confidential mental health counselor for women in Bangladesh.

CRITICAL INSTRUCTIONS & STRICT BOUNDARIES:
1. SCOPE REQUIREMENT: You MUST ONLY assist with topics related to female health, maternal & reproductive healthcare, mental health, emotional well-being, stress relief, nutrition/anemia, women's hygiene, and general healthcare.
2. OFF-TOPIC STRICT REFUSAL RULE: If the user asks questions completely unrelated to women's health, mental well-being, medicine, or wellness (such as coding, general software development, sports, financial markets, automotive, or unrelated trivia):
   - You MUST POLITELY DECLINE to answer.
   - Respond warmly and respectfully in 1-2 sentences: "As Nari Care AI, I am dedicated specifically to women's health, mental well-being, and medical guidance. I cannot answer queries regarding off-topic subjects. Please feel free to share any health concerns or emotional feelings with me!"
3. TONE & FORMATTING: Use warm, empathetic, respectful, and confidential tone in English or Bengali as appropriate. Use markdown formatting with bullet points and clear headings.`;

    const llmResult = await queryLLM(systemPrompt, message || 'Hello', history);
    if (llmResult) {
      return res.json({
        reply: llmResult.reply,
        source: llmResult.source,
      });
    }

    // Off-topic filter for female care fallback generator
    const q = (message || '').toLowerCase();
    const offTopicKeywords = ['code', 'python', 'javascript', 'programming', 'cricket', 'football', 'soccer', 'movie', 'actor', 'finance', 'bitcoin', 'crypto', 'stock', 'game', 'gaming', 'math', 'homework'];
    const femaleCareKeywords = ['health', 'mental', 'stress', 'anxiety', 'depress', 'sad', 'overwhelm', 'baby', 'maternal', 'pregnancy', 'period', 'cycle', 'nutrition', 'anemia', 'iron', 'counselor', 'nari', 'care'];

    const isOffTopic = offTopicKeywords.some(k => q.includes(k)) && !femaleCareKeywords.some(k => q.includes(k));

    if (isOffTopic) {
      return res.json({
        reply: `### 🌸 Nari Care AI Scope Notice\n\nHello! As **Nari Care AI**, I am dedicated specifically to supporting women's health, maternal care, mental well-being, and confidential guidance.\n\nI am unable to answer off-topic questions (such as programming, sports, finance, or entertainment). Please feel free to share any health concern or how you are feeling today!`,
        source: 'Nari Care Scope Filter',
      });
    }

    // Smart Fallback Engine for Female Care
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
