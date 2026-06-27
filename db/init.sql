-- ============================================
-- MediSense BD — Database Schema & Seed Data
-- ============================================

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'analyst',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Bangladesh 64 Districts
CREATE TABLE IF NOT EXISTS districts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_bn VARCHAR(100),
    division VARCHAR(100) NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    population INTEGER DEFAULT 0
);

-- Healthcare Facilities
CREATE TABLE IF NOT EXISTS hospitals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    district_id INTEGER REFERENCES districts(id),
    type VARCHAR(50) DEFAULT 'general',
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    total_beds INTEGER DEFAULT 0,
    available_beds INTEGER DEFAULT 0,
    has_emergency BOOLEAN DEFAULT false,
    phone VARCHAR(50)
);

-- DGDA Drug Registry
CREATE TABLE IF NOT EXISTS drug_registry (
    id SERIAL PRIMARY KEY,
    brand_name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    manufacturer VARCHAR(255),
    barcode VARCHAR(100) UNIQUE,
    dosage_form VARCHAR(100),
    strength VARCHAR(100),
    status VARCHAR(50) DEFAULT 'verified',
    registered_date DATE,
    expiry_date DATE
);

-- Outbreak Predictions (time-series)
CREATE TABLE IF NOT EXISTS outbreak_predictions (
    id SERIAL PRIMARY KEY,
    district_id INTEGER REFERENCES districts(id),
    disease VARCHAR(100) NOT NULL,
    predicted_date DATE NOT NULL,
    predicted_cases INTEGER DEFAULT 0,
    actual_cases INTEGER,
    probability DOUBLE PRECISION DEFAULT 0.0,
    temperature DOUBLE PRECISION,
    humidity DOUBLE PRECISION,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Health Equity Scores per Upazila
CREATE TABLE IF NOT EXISTS health_equity_scores (
    id SERIAL PRIMARY KEY,
    district_id INTEGER REFERENCES districts(id),
    upazila_name VARCHAR(255),
    equity_score DOUBLE PRECISION DEFAULT 0.0,
    doctor_ratio DOUBLE PRECISION,
    bed_ratio DOUBLE PRECISION,
    vaccine_coverage DOUBLE PRECISION,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Triage Sessions
CREATE TABLE IF NOT EXISTS triage_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    symptoms_text TEXT,
    language VARCHAR(10) DEFAULT 'bn',
    triage_level VARCHAR(50),
    recommendation TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Drug Verification Logs
CREATE TABLE IF NOT EXISTS verification_logs (
    id SERIAL PRIMARY KEY,
    barcode VARCHAR(100),
    drug_id INTEGER REFERENCES drug_registry(id),
    is_authentic BOOLEAN,
    confidence_score DOUBLE PRECISION,
    scanned_at TIMESTAMP DEFAULT NOW()
);

-- Activity Feed
CREATE TABLE IF NOT EXISTS activity_feed (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'info',
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- SEED DATA
-- ============================================

-- Default admin user (password: medisense2026)
-- bcrypt hash of 'medisense2026'
INSERT INTO users (email, password_hash, full_name, role) VALUES
('admin@medisense.bd', '$2a$10$GZXdNVyzCTeSQ4iOlkf2yeBWlI7aB1XlmX4Elo8S3oyZlIPgEMGWi', 'Admin User', 'admin');

-- Districts (all 64)
INSERT INTO districts (name, name_bn, division, lat, lng, population) VALUES
('Dhaka','ঢাকা','Dhaka',23.8103,90.4125,12043977),
('Gazipur','গাজীপুর','Dhaka',24.0023,90.4264,5015000),
('Narayanganj','নারায়ণগঞ্জ','Dhaka',23.6238,90.5000,3510000),
('Tangail','টাঙ্গাইল','Dhaka',24.2513,89.9167,3850000),
('Kishoreganj','কিশোরগঞ্জ','Dhaka',24.4449,90.7766,3100000),
('Manikganj','মানিকগঞ্জ','Dhaka',23.8617,90.0042,1580000),
('Munshiganj','মুন্সিগঞ্জ','Dhaka',23.5422,90.5305,1570000),
('Narsingdi','নরসিংদী','Dhaka',23.9322,90.7151,2460000),
('Faridpur','ফরিদপুর','Dhaka',23.6070,89.8420,2050000),
('Gopalganj','গোপালগঞ্জ','Dhaka',23.0050,89.8266,1300000),
('Madaripur','মাদারীপুর','Dhaka',23.1641,90.1978,1260000),
('Rajbari','রাজবাড়ী','Dhaka',23.7574,89.6445,1100000),
('Shariatpur','শরীয়তপুর','Dhaka',23.2423,90.4348,1250000),
('Chattogram','চট্টগ্রাম','Chattogram',22.3569,91.7832,8440000),
('Comilla','কুমিল্লা','Chattogram',23.4607,91.1809,5900000),
('Brahmanbaria','ব্রাহ্মণবাড়িয়া','Chattogram',23.9608,91.1115,3100000),
('Chandpur','চাঁদপুর','Chattogram',23.2513,90.8518,2600000),
('Coxs Bazar','কক্সবাজার','Chattogram',21.4272,92.0058,2900000),
('Feni','ফেনী','Chattogram',23.0159,91.3976,1600000),
('Khagrachhari','খাগড়াছড়ি','Chattogram',23.1322,91.9490,700000),
('Lakshmipur','লক্ষ্মীপুর','Chattogram',22.9425,90.8281,1900000),
('Noakhali','নোয়াখালী','Chattogram',22.8696,91.0995,3600000),
('Rangamati','রাঙ্গামাটি','Chattogram',22.7324,92.2985,650000),
('Bandarban','বান্দরবান','Chattogram',22.1953,92.2184,450000),
('Rajshahi','রাজশাহী','Rajshahi',24.3745,88.6042,2800000),
('Bogura','বগুড়া','Rajshahi',24.8510,89.3697,3700000),
('Chapainawabganj','চাঁপাইনবাবগঞ্জ','Rajshahi',24.5965,88.2775,1800000),
('Joypurhat','জয়পুরহাট','Rajshahi',25.0968,89.0227,1000000),
('Naogaon','নওগাঁ','Rajshahi',24.7936,88.9318,2800000),
('Natore','নাটোর','Rajshahi',24.4206,89.0000,1800000),
('Nawabganj','নবাবগঞ্জ','Rajshahi',24.5941,88.2775,1700000),
('Pabna','পাবনা','Rajshahi',24.0064,89.2372,2700000),
('Sirajganj','সিরাজগঞ্জ','Rajshahi',24.4534,89.7000,3200000),
('Khulna','খুলনা','Khulna',22.8456,89.5403,2400000),
('Bagerhat','বাগেরহাট','Khulna',22.6602,89.7895,1600000),
('Chuadanga','চুয়াডাঙ্গা','Khulna',23.6161,88.8263,1200000),
('Jessore','যশোর','Khulna',23.1667,89.2167,3000000),
('Jhenaidah','ঝিনাইদহ','Khulna',23.5448,89.1539,1900000),
('Kushtia','কুষ্টিয়া','Khulna',23.9013,89.1200,2100000),
('Magura','মাগুরা','Khulna',23.4872,89.4197,1050000),
('Meherpur','মেহেরপুর','Khulna',23.7627,88.6318,700000),
('Narail','নড়াইল','Khulna',23.1725,89.4951,800000),
('Satkhira','সাতক্ষীরা','Khulna',22.7185,89.0705,2100000),
('Sylhet','সিলেট','Sylhet',24.8949,91.8687,3600000),
('Habiganj','হবিগঞ্জ','Sylhet',24.3840,91.4015,2300000),
('Moulvibazar','মৌলভীবাজার','Sylhet',24.4829,91.7774,2100000),
('Sunamganj','সুনামগঞ্জ','Sylhet',25.0715,91.3950,2700000),
('Rangpur','রংপুর','Rangpur',25.7439,89.2752,3300000),
('Dinajpur','দিনাজপুর','Rangpur',25.6279,88.6332,3200000),
('Gaibandha','গাইবান্ধা','Rangpur',25.3288,89.5286,2600000),
('Kurigram','কুড়িগ্রাম','Rangpur',25.8072,89.6295,2300000),
('Lalmonirhat','লালমনিরহাট','Rangpur',25.9923,89.2847,1300000),
('Nilphamari','নীলফামারী','Rangpur',25.9316,88.8560,1900000),
('Panchagarh','পঞ্চগড়','Rangpur',26.3411,88.5542,1100000),
('Thakurgaon','ঠাকুরগাঁও','Rangpur',26.0336,88.4616,1500000),
('Barishal','বরিশাল','Barishal',22.7010,90.3535,2500000),
('Bhola','ভোলা','Barishal',22.1787,90.7101,1900000),
('Jhalokati','ঝালকাঠি','Barishal',22.6406,90.1987,750000),
('Patuakhali','পটুয়াখালী','Barishal',22.3596,90.3290,1700000),
('Pirojpur','পিরোজপুর','Barishal',22.5841,89.9720,1200000),
('Barguna','বরগুনা','Barishal',22.0953,90.1121,1000000),
('Mymensingh','ময়মনসিংহ','Mymensingh',24.7471,90.4203,5800000),
('Jamalpur','জামালপুর','Mymensingh',24.9375,89.9372,2500000),
('Netrokona','নেত্রকোনা','Mymensingh',24.8703,90.7279,2400000),
('Sherpur','শেরপুর','Mymensingh',25.0204,90.0170,1500000);

-- Hospitals (sample)
INSERT INTO hospitals (name, district_id, type, lat, lng, total_beds, available_beds, has_emergency, phone) VALUES
('Dhaka Medical College Hospital',1,'medical_college',23.7266,90.3976,2600,180,true,'02-55165088'),
('Bangabandhu Sheikh Mujib Medical University',1,'specialized',23.7393,90.3960,1800,95,true,'02-58614001'),
('National Institute of Cardiovascular Diseases',1,'specialized',23.7392,90.3843,500,32,true,'02-58615981'),
('Sir Salimullah Medical College Mitford Hospital',1,'medical_college',23.7150,90.3933,1200,67,true,'02-47310911'),
('Shaheed Suhrawardy Medical College Hospital',1,'medical_college',23.7540,90.3868,700,45,true,'02-58151272'),
('Chittagong Medical College Hospital',14,'medical_college',22.3630,91.8273,1900,120,true,'031-636774'),
('MAG Osmani Medical College Hospital',44,'medical_college',24.9012,91.8626,1100,78,true,'0821-714116'),
('Rajshahi Medical College Hospital',25,'medical_college',24.3667,88.6247,1500,92,true,'0721-772150'),
('Khulna Medical College Hospital',34,'medical_college',22.8180,89.5508,800,55,true,'041-761789'),
('Rangpur Medical College Hospital',48,'medical_college',25.7572,89.2550,900,65,true,'0521-63407'),
('Mymensingh Medical College Hospital',62,'medical_college',24.7518,90.4078,1050,70,true,'091-67377'),
('Barishal Sher-e-Bangla Medical College Hospital',56,'medical_college',22.6938,90.3615,700,48,true,'0431-63862'),
('Comilla Medical College Hospital',15,'medical_college',23.4428,91.1855,600,40,true,'081-67621'),
('Cox''s Bazar Sadar Hospital',18,'general',21.4462,92.0117,250,30,true,'0341-63088'),
('Gazipur Shaheed Tajuddin Ahmad Medical College',2,'medical_college',24.0084,90.4318,500,35,true,'02-49272001'),
('Upazila Health Complex Savar',1,'upazila',23.8583,90.2568,100,25,true,'02-7742285'),
('Ibn Sina Hospital Dhaka',1,'private',23.7509,90.3898,400,50,true,'09610-010614'),
('Square Hospital',1,'private',23.7524,90.3819,300,40,true,'02-8159457'),
('Apollo Hospital Dhaka',1,'private',23.7963,90.4143,200,30,true,'09666-787801'),
('Evercare Hospital',1,'private',23.8127,90.4235,350,45,true,'10678');

-- Drug Registry (sample)
INSERT INTO drug_registry (brand_name, generic_name, manufacturer, barcode, dosage_form, strength, status, registered_date) VALUES
('Napa','Paracetamol','Beximco Pharmaceuticals','8801016001018','Tablet','500mg','verified','2020-01-15'),
('Napa Extra','Paracetamol + Caffeine','Beximco Pharmaceuticals','8801016001025','Tablet','500mg+65mg','verified','2020-02-20'),
('Seclo','Omeprazole','Square Pharmaceuticals','8801045001013','Capsule','20mg','verified','2019-06-10'),
('Azimax','Azithromycin','Incepta Pharmaceuticals','8801030001017','Tablet','500mg','verified','2021-03-05'),
('Sergel','Esomeprazole','Healthcare Pharmaceuticals','8801058001012','Capsule','20mg','verified','2020-09-22'),
('Monas','Montelukast','Square Pharmaceuticals','8801045001020','Tablet','10mg','verified','2021-01-18'),
('Losectil','Omeprazole','Eskayef Pharmaceuticals','8801048001019','Capsule','20mg','verified','2019-11-30'),
('Ciprocin','Ciprofloxacin','Square Pharmaceuticals','8801045001037','Tablet','500mg','verified','2018-07-14'),
('Maxpro','Esomeprazole','Renata Limited','8801032001016','Capsule','40mg','verified','2020-05-08'),
('Tycil','Amoxicillin','Beximco Pharmaceuticals','8801016001032','Capsule','500mg','verified','2019-04-25'),
('Ace','Paracetamol','Square Pharmaceuticals','8801045001044','Tablet','500mg','verified','2018-12-01'),
('Zimax','Azithromycin','Square Pharmaceuticals','8801045001051','Tablet','250mg','verified','2020-08-15'),
('Pantonix','Pantoprazole','Incepta Pharmaceuticals','8801030001024','Tablet','40mg','verified','2021-06-20'),
('Cef-3','Cefixime','Square Pharmaceuticals','8801045001068','Capsule','200mg','verified','2019-10-10'),
('Neurotin','Gabapentin','Healthcare Pharmaceuticals','8801058001029','Capsule','300mg','verified','2020-11-05'),
('FAKE-Napa','Paracetamol','Unknown','0000000000001','Tablet','500mg','counterfeit','2023-01-01'),
('FAKE-Seclo','Omeprazole','Unknown','0000000000002','Capsule','20mg','counterfeit','2023-02-15'),
('FAKE-Azimax','Azithromycin','Unknown','0000000000003','Tablet','500mg','suspicious','2023-03-20');

-- Outbreak Predictions (sample time-series for Dhaka, Sylhet, Chattogram)
INSERT INTO outbreak_predictions (district_id, disease, predicted_date, predicted_cases, actual_cases, probability, temperature, humidity) VALUES
(1,'Dengue','2026-06-01',245,230,0.87,33.5,78.2),
(1,'Dengue','2026-06-08',312,NULL,0.91,34.1,81.5),
(1,'Dengue','2026-06-15',389,NULL,0.94,34.8,83.0),
(1,'Dengue','2026-06-22',425,NULL,0.89,33.9,80.1),
(1,'Dengue','2026-06-29',380,NULL,0.85,33.2,77.8),
(44,'Dengue','2026-06-01',78,65,0.72,31.2,82.5),
(44,'Dengue','2026-06-08',125,NULL,0.85,32.0,85.1),
(44,'Dengue','2026-06-15',180,NULL,0.91,32.8,87.3),
(14,'Dengue','2026-06-01',156,142,0.79,32.8,80.0),
(14,'Dengue','2026-06-08',198,NULL,0.83,33.5,82.4),
(14,'Dengue','2026-06-15',245,NULL,0.88,34.0,84.1),
(1,'Cholera','2026-06-01',35,28,0.45,33.5,78.2),
(1,'Cholera','2026-06-08',42,NULL,0.52,34.1,81.5),
(44,'Malaria','2026-06-01',22,18,0.38,31.2,82.5),
(44,'Malaria','2026-06-08',30,NULL,0.44,32.0,85.1),
(18,'Dengue','2026-06-01',55,48,0.65,31.0,85.0),
(18,'Dengue','2026-06-08',72,NULL,0.71,31.8,87.2),
(48,'Dengue','2026-06-01',40,35,0.55,30.5,79.0),
(48,'Dengue','2026-06-08',58,NULL,0.62,31.2,81.5);

-- Health Equity Scores
INSERT INTO health_equity_scores (district_id, upazila_name, equity_score, doctor_ratio, bed_ratio, vaccine_coverage) VALUES
(1,'Dhaka Sadar',0.92,1.8,3.2,0.95),
(1,'Savar',0.71,0.6,1.1,0.82),
(1,'Dhamrai',0.58,0.3,0.5,0.74),
(14,'Chattogram Sadar',0.85,1.5,2.8,0.91),
(14,'Patiya',0.52,0.2,0.4,0.68),
(44,'Sylhet Sadar',0.78,1.2,2.1,0.88),
(44,'Golapganj',0.45,0.15,0.3,0.62),
(25,'Rajshahi Sadar',0.80,1.3,2.5,0.89),
(34,'Khulna Sadar',0.76,1.1,2.0,0.86),
(48,'Rangpur Sadar',0.73,0.9,1.8,0.84),
(62,'Mymensingh Sadar',0.70,0.8,1.6,0.81),
(56,'Barishal Sadar',0.68,0.7,1.4,0.79),
(18,'Cox''s Bazar Sadar',0.48,0.2,0.35,0.60),
(23,'Rangamati Sadar',0.35,0.1,0.2,0.52),
(24,'Bandarban Sadar',0.32,0.08,0.18,0.48);

-- Activity Feed (recent events)
INSERT INTO activity_feed (category, message, severity, created_at) VALUES
('predict','High-risk dengue cluster forecasted in Sylhet Division','warning',NOW() - INTERVAL '2 hours'),
('verify','15 new drug verifications completed in Dhaka','info',NOW() - INTERVAL '3 hours'),
('navigate','Emergency SOS routing activated — Chittagong Medical College','critical',NOW() - INTERVAL '5 hours'),
('predict','Cholera probability elevated in coastal Barishal — 52% 7-day forecast','warning',NOW() - INTERVAL '8 hours'),
('verify','Counterfeit Napa batch intercepted in Gazipur — barcode mismatch','critical',NOW() - INTERVAL '12 hours'),
('navigate','Health Equity Index updated for 15 upazilas in Rangpur Division','info',NOW() - INTERVAL '1 day'),
('predict','Malaria risk decreasing in Chittagong Hill Tracts — down 18%','info',NOW() - INTERVAL '1 day'),
('verify','DGDA registry synced — 2,847 new drug entries verified','info',NOW() - INTERVAL '2 days'),
('navigate','New hospital registered: Upazila Health Complex, Teknaf','info',NOW() - INTERVAL '2 days'),
('predict','National dengue forecast model retrained with latest IEDCR data','info',NOW() - INTERVAL '3 days');
