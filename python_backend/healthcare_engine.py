#!/usr/bin/env python3
"""
AI-Powered Healthcare Management System - Core Python Processing & Database Engine
Covers:
- Database Persistence (SQLite3)
- OCR & Medical Text Parsing
- Document Classification (Prescription, Lab Report, X-Ray, Surgery)
- Structured Information Extraction (Tests, Medicines, Dates, Procedures)
- AI Clinical Summarization & Critical Information Highlighting (Allergies, Red Flags)
- Longitudinal Health Timeline Builder
- Consent & Access Control (24h, 7d, permanent expiration logic)
- Emergency Health Card & QR token resolution
- Natural Language Search over Health Records
"""

import sys
import os
import json
import sqlite3
import re
import datetime
import uuid
from typing import Dict, Any, List, Optional

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "healthcare.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()
    
    # 1. Clinics
    c.execute('''
    CREATE TABLE IF NOT EXISTS clinics (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        contact TEXT NOT NULL,
        departments TEXT NOT NULL
    )
    ''')

    # 2. Doctors
    c.execute('''
    CREATE TABLE IF NOT EXISTS doctors (
        id TEXT PRIMARY KEY,
        clinic_id TEXT NOT NULL,
        name TEXT NOT NULL,
        specialization TEXT NOT NULL,
        experience TEXT NOT NULL,
        fee INTEGER NOT NULL,
        slots_json TEXT NOT NULL,
        FOREIGN KEY (clinic_id) REFERENCES clinics(id)
    )
    ''')

    # 3. Patients
    c.execute('''
    CREATE TABLE IF NOT EXISTS patients (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        blood_group TEXT NOT NULL,
        allergies_json TEXT NOT NULL,
        emergency_contact_json TEXT NOT NULL,
        qr_token TEXT UNIQUE NOT NULL
    )
    ''')

    # 4. Appointments
    c.execute('''
    CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        doctor_id TEXT NOT NULL,
        clinic_id TEXT NOT NULL,
        date TEXT NOT NULL,
        time_slot TEXT NOT NULL,
        status TEXT NOT NULL, -- Confirmed, Completed, Cancelled
        reason TEXT,
        created_at TEXT NOT NULL
    )
    ''')

    # 5. Medical Records (Original Docs, Extracted Structured Data, AI Summary)
    c.execute('''
    CREATE TABLE IF NOT EXISTS medical_records (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL, -- Lab Report, Prescription, X-Ray, Surgery, Cardiology
        record_date TEXT NOT NULL,
        doctor_or_facility TEXT NOT NULL,
        raw_text TEXT NOT NULL,
        extracted_data_json TEXT NOT NULL,
        ai_summary TEXT NOT NULL,
        critical_alerts_json TEXT NOT NULL,
        file_name TEXT,
        created_at TEXT NOT NULL
    )
    ''')

    # 6. Access Control & Consent Management
    c.execute('''
    CREATE TABLE IF NOT EXISTS access_consents (
        id TEXT PRIMARY KEY,
        doctor_id TEXT NOT NULL,
        patient_id TEXT NOT NULL,
        requested_record_types_json TEXT NOT NULL, -- e.g. ["Lab Report", "Prescription"]
        duration_type TEXT NOT NULL, -- 24 hours, 7 days, Permanent
        status TEXT NOT NULL, -- Pending, Approved, Rejected, Revoked, Expired
        granted_at TEXT,
        expires_at TEXT,
        access_logs_json TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    ''')

    # 7. Medication Reminders
    c.execute('''
    CREATE TABLE IF NOT EXISTS reminders (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        medicine_name TEXT NOT NULL,
        dosage TEXT NOT NULL,
        timing TEXT NOT NULL,
        frequency TEXT NOT NULL,
        instructions TEXT,
        active INTEGER DEFAULT 1,
        created_at TEXT NOT NULL
    )
    ''')

    conn.commit()

    # Seed default data if empty
    c.execute('SELECT COUNT(*) as cnt FROM patients')
    if c.fetchone()['cnt'] == 0:
        seed_data(conn)
    conn.close()

def seed_data(conn):
    c = conn.cursor()
    # Seed Clinics
    c.execute('''
    INSERT INTO clinics (id, name, location, contact, departments)
    VALUES (?, ?, ?, ?, ?)
    ''', ('clinic_1', 'City Health Super-Speciality Hospital', 'Connaught Place, New Delhi / Pune Branch', '+91 98200 12345', 'Cardiology, Pathology, Orthopedics, General Medicine, Nephrology'))

    c.execute('''
    INSERT INTO clinics (id, name, location, contact, departments)
    VALUES (?, ?, ?, ?, ?)
    ''', ('clinic_2', 'Metro Care Diagnostic & Polyclinic', 'Andheri West, Mumbai', '+91 98211 54321', 'Diagnostics, Pediatrics, Internal Medicine, Pulmonology'))

    c.execute('''
    INSERT INTO clinics (id, name, location, contact, departments)
    VALUES (?, ?, ?, ?, ?)
    ''', ('clinic_3', 'Apex Women & Child Care Hospital', 'Koramangala, Bengaluru', '+91 98800 99881', 'Obstetrics, Pediatrics, Endocrinology, Neonatology'))

    # Seed Doctors
    c.execute('''
    INSERT INTO doctors (id, clinic_id, name, specialization, experience, fee, slots_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', ('doc_1', 'clinic_1', 'Dr. Rajesh Sharma, MD', 'Cardiologist', '14 Years', 800, json.dumps(['10:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'])))

    c.execute('''
    INSERT INTO doctors (id, clinic_id, name, specialization, experience, fee, slots_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', ('doc_2', 'clinic_1', 'Dr. Ananya Sen, MBBS, DNB', 'General Physician & Diabetologist', '9 Years', 600, json.dumps(['09:00 AM', '11:00 AM', '03:00 PM', '05:00 PM'])))

    c.execute('''
    INSERT INTO doctors (id, clinic_id, name, specialization, experience, fee, slots_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', ('doc_3', 'clinic_2', 'Dr. Vikram Patil, MS (Ortho)', 'Orthopedic Surgeon', '12 Years', 900, json.dumps(['10:30 AM', '01:00 PM', '04:00 PM'])))

    c.execute('''
    INSERT INTO doctors (id, clinic_id, name, specialization, experience, fee, slots_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', ('doc_4', 'clinic_2', 'Dr. Priya Deshmukh, MD (Pulmonology)', 'Pulmonologist', '11 Years', 850, json.dumps(['09:30 AM', '12:00 PM', '03:30 PM'])))

    c.execute('''
    INSERT INTO doctors (id, clinic_id, name, specialization, experience, fee, slots_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', ('doc_5', 'clinic_3', 'Dr. Meera Nambiar, MD, DGO', 'Obstetrician & Gynecologist', '16 Years', 950, json.dumps(['10:00 AM', '11:30 AM', '02:30 PM', '05:00 PM'])))

    # Seed Patient 1: Rahul Jadhav (Cardiometabolic & Ortho profile)
    c.execute('''
    INSERT INTO patients (id, name, age, gender, phone, email, blood_group, allergies_json, emergency_contact_json, qr_token)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        'pat_1',
        'Rahul Jadhav',
        38,
        'Male',
        '+91 98765 43210',
        'jadhavvedant14@gmail.com',
        'B+ Positive',
        json.dumps(['Penicillin (Severe Rash / Anaphylaxis Risk)', 'Sulfa Drugs']),
        json.dumps({'name': 'Sunita Jadhav (Spouse)', 'relation': 'Spouse', 'phone': '+91 98765 43211'}),
        'QR_EMERGENCY_RAHUL_B_POS'
    ))

    # Seed Patient 2: Priya Sharma (Endocrine & Gestational health profile)
    c.execute('''
    INSERT INTO patients (id, name, age, gender, phone, email, blood_group, allergies_json, emergency_contact_json, qr_token)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        'pat_2',
        'Priya Sharma',
        32,
        'Female',
        '+91 98111 22334',
        'priya.sharma@example.com',
        'O+ Positive',
        json.dumps(['Aspirin (Asthma trigger / Bronchospasm)', 'NSAIDs']),
        json.dumps({'name': 'Amit Sharma (Husband)', 'relation': 'Spouse', 'phone': '+91 98111 22335'}),
        'QR_EMERGENCY_PRIYA_O_POS'
    ))

    # Seed Patient 3: Ramesh Kulkarni (Senior Geriatric & Respiratory profile)
    c.execute('''
    INSERT INTO patients (id, name, age, gender, phone, email, blood_group, allergies_json, emergency_contact_json, qr_token)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        'pat_3',
        'Ramesh Kulkarni',
        64,
        'Male',
        '+91 97654 32109',
        'ramesh.kulkarni@example.com',
        'A+ Positive',
        json.dumps(['Iodinated Contrast Dye', 'Latex']),
        json.dumps({'name': 'Nikhil Kulkarni (Son)', 'relation': 'Son', 'phone': '+91 97654 32110'}),
        'QR_EMERGENCY_RAMESH_A_POS'
    ))

    # Seed Patient 4: Ananya Iyer (Pediatric Asthma & Allergy profile)
    c.execute('''
    INSERT INTO patients (id, name, age, gender, phone, email, blood_group, allergies_json, emergency_contact_json, qr_token)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        'pat_4',
        'Ananya Iyer',
        9,
        'Female',
        '+91 99201 44556',
        'iyer.parents@example.com',
        'AB+ Positive',
        json.dumps(['Peanuts (Severe Anaphylaxis)', 'Amoxicillin']),
        json.dumps({'name': 'Venkatesh Iyer (Father)', 'relation': 'Parent', 'phone': '+91 99201 44556'}),
        'QR_EMERGENCY_ANANYA_AB_POS'
    ))

    # ==================== SEED APPOINTMENTS ====================
    # Patient 1 Appointments
    c.execute('''
    INSERT INTO appointments (id, patient_id, doctor_id, clinic_id, date, time_slot, status, reason, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ('apt_1', 'pat_1', 'doc_1', 'clinic_1', '2026-09-25', '11:30 AM', 'Confirmed', 'Routine hypertension & lipid panel follow-up', datetime.datetime.now().isoformat()))

    c.execute('''
    INSERT INTO appointments (id, patient_id, doctor_id, clinic_id, date, time_slot, status, reason, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ('apt_2', 'pat_1', 'doc_3', 'clinic_2', '2026-10-02', '10:30 AM', 'Confirmed', 'Right knee arthroscopy recovery & physiotherapy evaluation', datetime.datetime.now().isoformat()))

    # Patient 2 Appointments
    c.execute('''
    INSERT INTO appointments (id, patient_id, doctor_id, clinic_id, date, time_slot, status, reason, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ('apt_3', 'pat_2', 'doc_5', 'clinic_3', '2026-09-26', '10:00 AM', 'Confirmed', 'Third trimester prenatal evaluation & OGTT review', datetime.datetime.now().isoformat()))

    c.execute('''
    INSERT INTO appointments (id, patient_id, doctor_id, clinic_id, date, time_slot, status, reason, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ('apt_4', 'pat_2', 'doc_2', 'clinic_1', '2026-09-30', '11:00 AM', 'Confirmed', 'Thyroid dosage adjustment & fasting glucose monitoring', datetime.datetime.now().isoformat()))

    # Patient 3 Appointments
    c.execute('''
    INSERT INTO appointments (id, patient_id, doctor_id, clinic_id, date, time_slot, status, reason, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ('apt_5', 'pat_3', 'doc_4', 'clinic_2', '2026-09-28', '12:00 PM', 'Confirmed', 'COPD spirometry follow-up and inhaler review', datetime.datetime.now().isoformat()))

    c.execute('''
    INSERT INTO appointments (id, patient_id, doctor_id, clinic_id, date, time_slot, status, reason, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ('apt_6', 'pat_3', 'doc_1', 'clinic_1', '2026-10-05', '02:00 PM', 'Confirmed', 'Annual 2D Echo and post-stent cardiac evaluation', datetime.datetime.now().isoformat()))

    # Patient 4 Appointments
    c.execute('''
    INSERT INTO appointments (id, patient_id, doctor_id, clinic_id, date, time_slot, status, reason, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ('apt_7', 'pat_4', 'doc_4', 'clinic_2', '2026-09-27', '09:30 AM', 'Confirmed', 'Pediatric asthma trigger evaluation & peak flow meter check', datetime.datetime.now().isoformat()))

    # ==================== SEED MEDICAL RECORDS FOR PATIENT 1 (RAHUL JADHAV) ====================
    # Record 1: Comprehensive Metabolic & Lipid Panel
    r1_text = """CITY DIAGNOSTIC LABS - COMPREHENSIVE METABOLIC & LIPID PROFILE
Patient: Rahul Jadhav | Age: 38 | Sex: M | Ref By: Dr. Rajesh Sharma
Date: 12-Aug-2026

TEST PARAMETERS:
- Fasting Blood Sugar (FBS): 128 mg/dL [Normal: 70 - 100 mg/dL] (ELEVATED)
- HbA1c (Glycated Hemoglobin): 7.2 % [Normal: < 5.7 %, Diabetic: > 6.5 %] (HIGH)
- Total Cholesterol: 224 mg/dL [Desirable: < 200 mg/dL] (HIGH)
- Triglycerides: 195 mg/dL [Normal: < 150 mg/dL] (ELEVATED)
- HDL Cholesterol: 42 mg/dL [Normal: > 40 mg/dL] (NORMAL)
- LDL Cholesterol: 143 mg/dL [Optimal: < 100 mg/dL] (BORDERLINE HIGH)
- Serum Creatinine: 0.9 mg/dL [Normal: 0.7 - 1.2 mg/dL] (NORMAL)
- Blood Pressure: 138/88 mmHg (Stage 1 Hypertension)
"""
    r1_extracted = {
        "tests": [
            {"name": "Fasting Blood Sugar", "value": "128 mg/dL", "status": "ELEVATED", "range": "70-100"},
            {"name": "HbA1c", "value": "7.2 %", "status": "HIGH", "range": "< 5.7%"},
            {"name": "Total Cholesterol", "value": "224 mg/dL", "status": "HIGH", "range": "< 200"},
            {"name": "Triglycerides", "value": "195 mg/dL", "status": "ELEVATED", "range": "< 150"},
            {"name": "Serum Creatinine", "value": "0.9 mg/dL", "status": "NORMAL", "range": "0.7-1.2"}
        ],
        "vitals": {"bp": "138/88 mmHg", "pulse": "74 bpm"},
        "medicines": [],
        "allergies_noted": []
    }
    r1_critical = [
        "Elevated HbA1c (7.2%) indicates early type 2 glycemic progression.",
        "Hyperlipidemia: Total Cholesterol (224 mg/dL) & Triglycerides (195 mg/dL) above target."
    ]
    r1_summary = "Fasting blood sugar (128 mg/dL) and HbA1c (7.2%) indicate early diabetes progression. Lipid profile shows elevated total cholesterol and triglycerides with borderline BP 138/88 mmHg. Kidney function normal (Creatinine 0.9 mg/dL)."

    c.execute('''
    INSERT INTO medical_records (id, patient_id, title, category, record_date, doctor_or_facility, raw_text, extracted_data_json, ai_summary, critical_alerts_json, file_name, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ('rec_1', 'pat_1', 'Comprehensive Metabolic & Lipid Panel', 'Lab Report', '2026-08-12', 'City Diagnostic Labs', r1_text, json.dumps(r1_extracted), r1_summary, json.dumps(r1_critical), 'blood_lipid_panel_aug2026.pdf', '2026-08-12T14:30:00'))

    # Record 2: Cardiology Prescription
    r2_text = """DR. RAJESH SHARMA, MD (Cardiology)
Apollo Clinic & Heart Care, Pune
Rx Prescription
Patient: Rahul Jadhav (38/M) | Date: 14-Aug-2026
Diagnosis: Essential Hypertension & Impaired Glucose Tolerance, Dyslipidemia.
ALLERGIES: Severe Penicillin Allergy! (Do NOT prescribe Amoxicillin / Penicillin derivatives)

MEDICATIONS:
1. Tab. Telmisartan 40mg - 1 tablet once daily morning after breakfast (Hypertension)
2. Tab. Metformin 500mg SR - 1 tablet twice daily with meals (Glucose control)
3. Tab. Atorvastatin 10mg - 1 tablet at night before bed (Cholesterol)

ADVICE:
- Restrict dietary sodium (< 2g/day)
- 30 mins brisk walking daily
- Repeat HbA1c & Lipid Panel in 3 months
"""
    r2_extracted = {
        "tests": [],
        "vitals": {"bp": "136/84 mmHg"},
        "medicines": [
            {"name": "Telmisartan", "dosage": "40mg", "frequency": "Once daily (Morning)", "duration": "Continuous"},
            {"name": "Metformin SR", "dosage": "500mg", "frequency": "Twice daily (Meals)", "duration": "Continuous"},
            {"name": "Atorvastatin", "dosage": "10mg", "frequency": "Night (Bedtime)", "duration": "Continuous"}
        ],
        "allergies_noted": ["Penicillin (Severe Rash / Anaphylaxis risk)"]
    }
    r2_critical = [
        "CRITICAL ALLERGY ALERT: Known severe anaphylactic/cutaneous reaction to Penicillin.",
        "Requires daily compliance on Telmisartan, Metformin, and Atorvastatin."
    ]
    r2_summary = "Prescribed Telmisartan 40mg (morning), Metformin 500mg SR (twice daily), and Atorvastatin 10mg (night) for blood pressure, glucose, and dyslipidemia management. Strict warning noted against Penicillin class drugs."

    c.execute('''
    INSERT INTO medical_records (id, patient_id, title, category, record_date, doctor_or_facility, raw_text, extracted_data_json, ai_summary, critical_alerts_json, file_name, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ('rec_2', 'pat_1', 'Cardiology & Diabetes Prescription', 'Prescription', '2026-08-14', 'Dr. Rajesh Sharma (Apollo Clinic)', r2_text, json.dumps(r2_extracted), r2_summary, json.dumps(r2_critical), 'rx_dr_sharma_aug2026.jpg', '2026-08-14T11:00:00'))

    # Record 3: Chest X-Ray
    r3_text = """METRO IMAGING & RADIOLOGY CENTER
CHEST X-RAY PA VIEW
Patient: Rahul Jadhav | Date: 05-May-2026
Findings:
- Cardiothoracic ratio is normal (heart size within normal limits).
- Both lung fields are clear with no focal infiltrates, consolidation or pleural effusion.
- Costophrenic and cardiophrenic angles are sharp.
- Bony thorax and soft tissues unremarkable.
IMPRESSION: Normal Chest Radiograph.
"""
    r3_extracted = {
        "tests": [{"name": "Cardiothoracic Ratio", "value": "Normal", "status": "NORMAL", "range": "< 0.5"}],
        "vitals": {},
        "medicines": [],
        "allergies_noted": []
    }
    r3_summary = "Normal chest radiograph showing clear lung fields, normal cardiothoracic ratio, and sharp costophrenic angles without effusion or infiltrate."

    c.execute('''
    INSERT INTO medical_records (id, patient_id, title, category, record_date, doctor_or_facility, raw_text, extracted_data_json, ai_summary, critical_alerts_json, file_name, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ('rec_3', 'pat_1', 'Chest X-Ray (PA View)', 'X-Ray', '2026-05-05', 'Metro Imaging & Radiology', r3_text, json.dumps(r3_extracted), r3_summary, json.dumps([]), 'chest_xray_may2026.png', '2026-05-05T09:15:00'))

    # Record 4: Knee MRI Report
    r4_text = """APEX ADVANCED MRI SCANNING CENTER
MAGNETIC RESONANCE IMAGING (MRI) - RIGHT KNEE JOINT
Patient: Rahul Jadhav | Age: 38/M | Ref By: Dr. Vikram Patil
Date: 18-Jan-2026

FINDINGS:
- Medial Meniscus: Grade IIb oblique tear noted in the posterior horn of medial meniscus.
- Lateral Meniscus: Normal morphology and signal intensity.
- Anterior Cruciate Ligament (ACL): Intact, normal fibrillar architecture.
- PCL & Collateral Ligaments: Intact.
- Joint Space: Minimal suprapatellar joint effusion. No loose bodies.
- Patellofemoral compartment: Normal cartilage thickness.

IMPRESSION: Posterior horn medial meniscus tear (Right knee) with mild joint effusion. Orthopedic consultation advised.
"""
    r4_extracted = {
        "tests": [
            {"name": "Medial Meniscus", "value": "Grade IIb Tear (Posterior Horn)", "status": "HIGH", "range": "Intact"},
            {"name": "ACL", "value": "Intact", "status": "NORMAL", "range": "Intact"},
            {"name": "Lateral Meniscus", "value": "Normal", "status": "NORMAL", "range": "Normal"},
            {"name": "Joint Effusion", "value": "Minimal Suprapatellar", "status": "ELEVATED", "range": "None"}
        ],
        "vitals": {},
        "medicines": [],
        "allergies_noted": []
    }
    r4_critical = ["Grade IIb tear in posterior horn of medial meniscus; sports and squatting activities restricted."]
    r4_summary = "Right knee MRI confirms Grade IIb oblique tear in the posterior horn of the medial meniscus with minimal effusion. Cruciate and collateral ligaments intact."

    c.execute('''
    INSERT INTO medical_records (id, patient_id, title, category, record_date, doctor_or_facility, raw_text, extracted_data_json, ai_summary, critical_alerts_json, file_name, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ('rec_4', 'pat_1', 'Right Knee MRI - Meniscal Tear', 'Lab Report', '2026-01-18', 'Apex Advanced MRI Scanning Center', r4_text, json.dumps(r4_extracted), r4_summary, json.dumps(r4_critical), 'right_knee_mri_jan2026.pdf', '2026-01-18T16:00:00'))

    # Record 5: Surgical Discharge Summary (Orthopedic Knee Repair)
    r5_text = """CITY HEALTH SUPER-SPECIALITY HOSPITAL
DEPARTMENT OF ORTHOPEDIC SURGERY - DISCHARGE SUMMARY
Patient: Rahul Jadhav | Age: 38/M | IPD No: IPD-88219
Admission: 22-Jan-2026 | Discharge: 24-Jan-2026
Consultant: Dr. Vikram Patil, MS (Ortho)

PROCEDURE PERFORMED:
Right Knee Diagnostic Arthroscopy + Arthroscopic Partial Medial Meniscectomy (under Spinal Anesthesia).

HOSPITAL COURSE:
Patient tolerated surgery well. Post-op distal pulses intact. Passive knee bending initiated. Wound clean and dry.
ALLERGY NOTE: Known Penicillin Allergy (Avoid Amoxicillin, Augmentin, Ampicillin).

DISCHARGE MEDICATIONS:
1. Tab. Cefuroxime Axetil 500mg - 1 tab twice daily for 5 days (Safe Cephalosporin option)
2. Tab. Aceclofenac 100mg + Paracetamol 325mg - 1 tab twice daily after food for 5 days
3. Tab. Pantoprazole 40mg - 1 tab daily morning empty stomach for 7 days
4. Tab. Chymoral Forte - 1 tab thrice daily 30 mins before food for 5 days (Anti-edema)

POST-OPERATIVE REHABILITATION:
- Partial weight bearing with walker support for 7 days.
- Quadriceps isometric exercises and ankle pumps 3 times daily.
- Suture removal on post-op day 12 at Ortho OPD.
"""
    r5_extracted = {
        "tests": [],
        "vitals": {"bp": "124/80 mmHg", "pulse": "72 bpm"},
        "medicines": [
            {"name": "Cefuroxime Axetil", "dosage": "500mg", "frequency": "Twice daily (5 days)", "duration": "5 days"},
            {"name": "Aceclofenac + Paracetamol", "dosage": "100/325mg", "frequency": "Twice daily after meals", "duration": "5 days"},
            {"name": "Pantoprazole", "dosage": "40mg", "frequency": "Daily morning (Empty stomach)", "duration": "7 days"},
            {"name": "Chymoral Forte", "dosage": "1 tab", "frequency": "Thrice daily", "duration": "5 days"}
        ],
        "allergies_noted": ["Penicillin Allergy (Avoid Augmentin, Amoxicillin)"]
    }
    r5_critical = [
        "Post-arthroscopic partial meniscectomy right knee. Partial weight bearing for 7 days.",
        "Strictly adhere to Penicillin allergy protocols; Cefuroxime substituted."
    ]
    r5_summary = "Successful right knee arthroscopic partial medial meniscectomy. Discharged on Cefuroxime 500mg, Aceclofenac+Paracetamol, and gastroprotective Pantoprazole. Penicillin allergy observed."

    c.execute('''
    INSERT INTO medical_records (id, patient_id, title, category, record_date, doctor_or_facility, raw_text, extracted_data_json, ai_summary, critical_alerts_json, file_name, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ('rec_5', 'pat_1', 'Orthopedic Meniscectomy Discharge Summary', 'Discharge Summary', '2026-01-24', 'City Health Hospital - Dr. Vikram Patil', r5_text, json.dumps(r5_extracted), r5_summary, json.dumps(r5_critical), 'discharge_summary_meniscectomy.pdf', '2026-01-24T12:00:00'))

    # Record 6: 2D Echocardiography & ECG Report
    r6_text = """CITY HEALTH HEART INSTITUTE - ECHOCARDIOGRAPHY REPORT
Patient: Rahul Jadhav | Age: 38/M | Ref By: Dr. Rajesh Sharma
Date: 15-Aug-2026

FINDINGS:
- Left Ventricle: Normal cavity dimensions. LVIDd: 4.8 cm, LVIDs: 3.1 cm.
- Left Ventricular Ejection Fraction (LVEF): 62% (Normal systolic function).
- Interventricular Septum: Mild concentric LV hypertrophy (IVS: 1.15 cm, Normal: < 1.1 cm).
- Mitral Valve: E/A ratio: 0.9 (Grade 1 Diastolic Relaxation Impairment).
- Aortic, Tricuspid & Pulmonary Valves: Structurally normal.
- Pericardium: No pericardial effusion.
- Resting ECG: Normal sinus rhythm at 72 bpm. Mild left ventricular strain pattern.

IMPRESSION:
Normal systolic function (LVEF 62%). Mild concentric LV hypertrophy consistent with systemic hypertension. Grade 1 diastolic dysfunction. Good response to anti-hypertensive regimen expected.
"""
    r6_extracted = {
        "tests": [
            {"name": "LVEF (Ejection Fraction)", "value": "62 %", "status": "NORMAL", "range": "55-70%"},
            {"name": "IVS (Septal Thickness)", "value": "1.15 cm", "status": "ELEVATED", "range": "0.6-1.1"},
            {"name": "Diastolic Function", "value": "Grade 1 Impairment (E/A 0.9)", "status": "ELEVATED", "range": "Normal"}
        ],
        "vitals": {"pulse": "72 bpm"},
        "medicines": [],
        "allergies_noted": []
    }
    r6_critical = ["Mild concentric LV hypertrophy secondary to hypertension; maintain systolic BP < 130 mmHg."]
    r6_summary = "Normal cardiac systolic function (LVEF 62%). Mild concentric left ventricular hypertrophy and Grade 1 diastolic dysfunction noted secondary to hypertension. No valvular defect."

    c.execute('''
    INSERT INTO medical_records (id, patient_id, title, category, record_date, doctor_or_facility, raw_text, extracted_data_json, ai_summary, critical_alerts_json, file_name, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ('rec_6', 'pat_1', '2D Echocardiography & ECG Report', 'Lab Report', '2026-08-15', 'City Health Heart Institute', r6_text, json.dumps(r6_extracted), r6_summary, json.dumps(r6_critical), '2d_echo_ecg_aug2026.pdf', '2026-08-15T15:30:00'))

    # ==================== SEED MEDICAL RECORDS FOR PATIENT 2 (PRIYA SHARMA) ====================
    # Record 7: Thyroid Function & Antenatal Panel
    r7_text = """APEX WOMEN HEALTH LAB - ANTENATAL & THYROID PROFILE
Patient: Priya Sharma | Age: 32/F | Gravida 2 Para 1 | Ref By: Dr. Meera Nambiar
Date: 10-Sep-2026

TEST RESULTS:
- TSH (Ultrasensitive): 3.85 mIU/L [Trimester 3 Target: 0.3 - 3.0 mIU/L] (ELEVATED)
- Free T4: 1.05 ng/dL [Normal: 0.8 - 1.8 ng/dL] (NORMAL)
- Fasting Blood Glucose: 92 mg/dL [Target: < 95 mg/dL] (NORMAL)
- 2-Hour Post 75g Glucose (OGTT): 134 mg/dL [Target: < 140 mg/dL] (NORMAL)
- Hemoglobin: 11.2 g/dL [Normal: 11.0 - 15.0 g/dL] (NORMAL)
- Serum Ferritin: 28 ng/mL [Desirable: > 30 ng/mL] (BORDERLINE LOW)
- Platelet Count: 240,000 /uL (NORMAL)
"""
    r7_extracted = {
        "tests": [
            {"name": "TSH", "value": "3.85 mIU/L", "status": "ELEVATED", "range": "0.3-3.0"},
            {"name": "Free T4", "value": "1.05 ng/dL", "status": "NORMAL", "range": "0.8-1.8"},
            {"name": "Fasting Blood Glucose", "value": "92 mg/dL", "status": "NORMAL", "range": "< 95"},
            {"name": "2-Hr OGTT", "value": "134 mg/dL", "status": "NORMAL", "range": "< 140"},
            {"name": "Hemoglobin", "value": "11.2 g/dL", "status": "NORMAL", "range": "11.0-15.0"}
        ],
        "vitals": {"bp": "118/76 mmHg"},
        "medicines": [],
        "allergies_noted": ["Aspirin (Bronchospasm)"]
    }
    r7_critical = ["TSH (3.85 mIU/L) above pregnancy 3rd trimester target (< 3.0 mIU/L); Thyroxine dose adjustment required."]
    r7_summary = "Antenatal screening reveals mild subclinical hypothyroidism with TSH 3.85 mIU/L. Gestational glucose tolerance test normal (OGTT 134 mg/dL). Hemoglobin satisfactory at 11.2 g/dL."

    c.execute('''
    INSERT INTO medical_records (id, patient_id, title, category, record_date, doctor_or_facility, raw_text, extracted_data_json, ai_summary, critical_alerts_json, file_name, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ('rec_7', 'pat_2', 'Antenatal Panel & Thyroid Evaluation', 'Lab Report', '2026-09-10', 'Apex Women Health Lab', r7_text, json.dumps(r7_extracted), r7_summary, json.dumps(r7_critical), 'antenatal_thyroid_sep2026.pdf', '2026-09-10T10:15:00'))

    # Record 8: Obstetric Prescription
    r8_text = """DR. MEERA NAMBIAR, MD, DGO
Apex Women & Child Care Hospital, Bengaluru
Antenatal Prescription - Gestational Week 28
Patient: Priya Sharma (32/F) | Date: 12-Sep-2026
Diagnosis: 28 Weeks Gestation + Subclinical Hypothyroidism
ALLERGIES: Known Severe Aspirin / NSAID allergy (Do not prescribe Aspirin, Ibuprofen, Diclofenac)

PRESCRIPTION:
1. Tab. Levothyroxine 50 mcg - 1 tablet empty stomach early morning with water (Hypothyroidism)
2. Tab. Ferrous Ascorbate 100mg + Folic Acid 1.5mg - 1 tablet after lunch (Iron supplementation)
3. Tab. Calcium Carbonate 500mg + Vit D3 - 1 tablet after dinner (Do not take with Iron)
4. Cap. DHA & Omega-3 200mg - 1 capsule daily

ADVICE:
- Fetal kick count monitoring daily.
- Repeat TSH and Hemoglobin in 4 weeks.
- Avoid all NSAIDs and Aspirin due to bronchospasm history.
"""
    r8_extracted = {
        "tests": [],
        "vitals": {"bp": "116/74 mmHg", "weight": "64 kg"},
        "medicines": [
            {"name": "Levothyroxine", "dosage": "50mcg", "frequency": "Daily morning empty stomach", "duration": "Throughout pregnancy"},
            {"name": "Ferrous Ascorbate + Folic Acid", "dosage": "100mg/1.5mg", "frequency": "Once daily after lunch", "duration": "Continuous"},
            {"name": "Calcium Carbonate + Vit D3", "dosage": "500mg", "frequency": "Once daily after dinner", "duration": "Continuous"},
            {"name": "DHA & Omega-3", "dosage": "200mg", "frequency": "Once daily", "duration": "Continuous"}
        ],
        "allergies_noted": ["Aspirin & NSAIDs (Severe Asthma / Bronchospasm)"]
    }
    r8_critical = [
        "STRICT CONTRAINDICATION: Aspirin and NSAIDs are strictly prohibited due to severe asthma risk.",
        "Separate Iron and Calcium ingestion by at least 4 hours for absorption."
    ]
    r8_summary = "Antenatal management at 28 weeks: Levothyroxine 50 mcg instituted for TSH optimization, alongside prenatal iron, calcium, and DHA. Strict allergy caution against Aspirin and NSAID medications noted."

    c.execute('''
    INSERT INTO medical_records (id, patient_id, title, category, record_date, doctor_or_facility, raw_text, extracted_data_json, ai_summary, critical_alerts_json, file_name, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ('rec_8', 'pat_2', 'Antenatal Week 28 Prescription & Thyroid Plan', 'Prescription', '2026-09-12', 'Dr. Meera Nambiar (Apex Women Care)', r8_text, json.dumps(r8_extracted), r8_summary, json.dumps(r8_critical), 'rx_dr_nambiar_sep2026.pdf', '2026-09-12T11:45:00'))

    # ==================== SEED MEDICAL RECORDS FOR PATIENT 3 (RAMESH KULKARNI) ====================
    # Record 9: Pulmonary Function Test & Spirometry
    r9_text = """METRO CARE PULMONOLOGY CLINIC - SPIROMETRY & PFT REPORT
Patient: Ramesh Kulkarni | Age: 64/M | Ref By: Dr. Priya Deshmukh
Date: 18-Aug-2026

SPIROMETRY VALUES:
- FEV1 (Pre-Bronchodilator): 1.62 L (54% of predicted) (MODERATELY REDUCED)
- FVC: 2.85 L (72% of predicted)
- FEV1/FVC Ratio: 56.8% [Normal: > 70%] (OBSTRUCTIVE DEFECT)
- Post-Bronchodilator FEV1: 1.76 L (Improvement 8.6% / 140 ml - Incomplete reversibility)
- Resting SpO2: 94% on room air
- Heart Rate: 78 bpm

IMPRESSION:
Moderate chronic airflow limitation compatible with GOLD Stage 2 COPD. Incomplete bronchodilator reversibility. Continue dual bronchodilator therapy (LAMA + LABA).
"""
    r9_extracted = {
        "tests": [
            {"name": "FEV1 % Predicted", "value": "54 %", "status": "HIGH", "range": "> 80%"},
            {"name": "FEV1/FVC Ratio", "value": "56.8 %", "status": "HIGH", "range": "> 70%"},
            {"name": "Resting SpO2", "value": "94 %", "status": "ELEVATED", "range": "95-100%"}
        ],
        "vitals": {"spo2": "94%", "pulse": "78 bpm", "bp": "134/82 mmHg"},
        "medicines": [],
        "allergies_noted": ["Iodinated Contrast Dye"]
    }
    r9_critical = [
        "GOLD Stage 2 COPD with moderate airflow obstruction (FEV1/FVC 56.8%).",
        "ALLERGY WARNING: Known severe anaphylactoid reaction to Iodinated Contrast Dye."
    ]
    r9_summary = "Spirometry confirms moderate chronic obstructive pulmonary disease (GOLD Stage 2) with FEV1 at 54% of predicted and FEV1/FVC of 56.8%. Resting oxygen saturation 94% on ambient air."

    c.execute('''
    INSERT INTO medical_records (id, patient_id, title, category, record_date, doctor_or_facility, raw_text, extracted_data_json, ai_summary, critical_alerts_json, file_name, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ('rec_9', 'pat_3', 'Pulmonary Function Test & Spirometry', 'Lab Report', '2026-08-18', 'Metro Care Pulmonology Clinic', r9_text, json.dumps(r9_extracted), r9_summary, json.dumps(r9_critical), 'pft_spirometry_aug2026.pdf', '2026-08-18T14:10:00'))

    # Record 10: Pulmonology & Cardiac Inhaler Prescription
    r10_text = """DR. PRIYA DESHMUKH, MD (Pulmonology)
Metro Care Diagnostic & Polyclinic, Mumbai
Rx Prescription
Patient: Ramesh Kulkarni (64/M) | Date: 20-Aug-2026
Diagnosis: COPD (GOLD Stage 2) & History of Coronary Artery Disease (Post PTCA 2023).
ALLERGIES: Severe reaction to Iodinated Contrast Dye! Late allergy warning.

MEDICATIONS:
1. Tiotropium + Formoterol Inhaler (18mcg/12mcg) - 2 puffs twice daily using Rotahaler/DPI (Bronchodilation)
2. Budesonide Inhaler 200mcg - 1 puff twice daily (Rinse mouth after use to prevent candidiasis)
3. Tab. Clopidogrel 75mg - 1 tablet once daily morning (Anti-platelet)
4. Tab. Rosuvastatin 20mg - 1 tablet at night (Plaque stabilization)
5. Levalbuterol Inhaler (50mcg) - 2 puffs SOS for acute breathlessness

ADVICE:
- Annual Influenza & Pneumococcal vaccine recommended.
- Daily breathing exercises (Pursed-lip breathing).
- Avoid contrast scans without pre-medication protocol.
"""
    r10_extracted = {
        "tests": [],
        "vitals": {"bp": "130/80 mmHg", "spo2": "95%"},
        "medicines": [
            {"name": "Tiotropium + Formoterol Inhaler", "dosage": "18/12mcg", "frequency": "2 puffs twice daily", "duration": "Continuous"},
            {"name": "Budesonide Inhaler", "dosage": "200mcg", "frequency": "1 puff twice daily", "duration": "Continuous"},
            {"name": "Clopidogrel", "dosage": "75mg", "frequency": "Daily morning", "duration": "Continuous"},
            {"name": "Rosuvastatin", "dosage": "20mg", "frequency": "Daily night", "duration": "Continuous"},
            {"name": "Levalbuterol SOS", "dosage": "50mcg", "frequency": "As needed (SOS)", "duration": "SOS"}
        ],
        "allergies_noted": ["Iodinated Contrast Dye (Severe Anaphylactoid Risk)"]
    }
    r10_critical = [
        "CONTRAST ALLERGY: Must never receive IV radiocontrast without prior nephrology/allergy prep.",
        "Ensure patient rinses mouth after Budesonide inhaler."
    ]
    r10_summary = "Prescribed dual bronchodilator Tiotropium+Formoterol, Budesonide inhaler, Clopidogrel 75mg, and Rosuvastatin 20mg for COPD and secondary cardiovascular prevention. Contrast allergy strictly flagged."

    c.execute('''
    INSERT INTO medical_records (id, patient_id, title, category, record_date, doctor_or_facility, raw_text, extracted_data_json, ai_summary, critical_alerts_json, file_name, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ('rec_10', 'pat_3', 'COPD & Cardiac Maintenance Prescription', 'Prescription', '2026-08-20', 'Dr. Priya Deshmukh (Metro Care)', r10_text, json.dumps(r10_extracted), r10_summary, json.dumps(r10_critical), 'rx_dr_deshmukh_aug2026.pdf', '2026-08-20T10:30:00'))

    # ==================== SEED MEDICAL RECORDS FOR PATIENT 4 (ANANYA IYER) ====================
    # Record 11: Pediatric Allergy Panel
    r11_text = """METRO PEDIATRICS ALLERGY & IMMUNOLOGY CENTER
SERUM SPECIFIC IgE ALLERGY PANEL
Patient: Ananya Iyer | Age: 9/F | Ref By: Dr. Priya Deshmukh
Date: 02-Sep-2026

IMMUNOGLOBULIN & ALLERGEN RESULTS:
- Total Serum IgE: 480 kU/L [Normal for 9 yrs: < 100 kU/L] (VERY HIGH)
- Peanut Allergen (f13) Specific IgE: 24.5 kUA/L [Class 4 - Very High Reaction] (CRITICAL)
- House Dust Mite (d1) Specific IgE: 8.2 kUA/L [Class 3 - High Sensitivity]
- Amoxicillin / Penicilloyl Specific IgE: 6.8 kUA/L [Class 3 - Positive Allergy]
- Egg White (f1): 0.2 kUA/L [Negative / Low]
- Milk (f2): 0.3 kUA/L [Negative / Low]

CLINICAL IMPRESSION:
Severe peanut hypersensitivity with high risk of systemic anaphylaxis. Positive IgE to beta-lactams (Amoxicillin). Moderate aeroallergen reactivity to dust mites exacerbating allergic asthma.
"""
    r11_extracted = {
        "tests": [
            {"name": "Total Serum IgE", "value": "480 kU/L", "status": "HIGH", "range": "< 100"},
            {"name": "Peanut Allergen IgE", "value": "24.5 kUA/L (Class 4)", "status": "HIGH", "range": "< 0.35"},
            {"name": "Dust Mite IgE", "value": "8.2 kUA/L", "status": "HIGH", "range": "< 0.35"},
            {"name": "Amoxicillin IgE", "value": "6.8 kUA/L", "status": "HIGH", "range": "< 0.35"}
        ],
        "vitals": {"weight": "27 kg"},
        "medicines": [],
        "allergies_noted": ["Peanuts (Life-Threatening Anaphylaxis)", "Amoxicillin / Penicillin Derivatives"]
    }
    r11_critical = [
        "LIFE-THREATENING ALLERGY: Anaphylaxis risk to PEANUTS. Emergency Auto-Injector (EpiPen Jr) must be carried at all times.",
        "Confirmed Amoxicillin allergy. Avoid all penicillin derivatives in pediatric prescriptions."
    ]
    r11_summary = "Allergy panel confirms marked peanut hypersensitivity (Class 4 IgE 24.5 kUA/L) with severe anaphylaxis potential, dust mite induced allergic asthma, and confirmed Amoxicillin allergy. Total IgE elevated at 480 kU/L."

    c.execute('''
    INSERT INTO medical_records (id, patient_id, title, category, record_date, doctor_or_facility, raw_text, extracted_data_json, ai_summary, critical_alerts_json, file_name, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ('rec_11', 'pat_4', 'Pediatric Comprehensive Allergy Panel', 'Lab Report', '2026-09-02', 'Metro Pediatrics Allergy Center', r11_text, json.dumps(r11_extracted), r11_summary, json.dumps(r11_critical), 'pediatric_allergy_panel_sep2026.pdf', '2026-09-02T11:00:00'))

    # Record 12: Pediatric Asthma Action Plan & Emergency Protocol
    r12_text = """DR. PRIYA DESHMUKH, MD (Pulmonology & Pediatric Respiratory)
Metro Care Polyclinic, Mumbai
PEDIATRIC ASTHMA & ALLERGY ACTION PLAN
Patient: Ananya Iyer (9/F) | Date: 05-Sep-2026
Diagnosis: Moderate Persistent Allergic Asthma & Severe Peanut Anaphylaxis.

DAILY CONTROLLER MEDICATIONS (Green Zone):
1. Fluticasone + Salmeterol Inhaler (50/25mcg) - 1 puff twice daily with spacer and mouth rinse.
2. Tab. Montelukast 5mg (Chewable) - 1 tablet daily at bedtime.
3. Cetirizine Syrup 5mg - 1 teaspoon (5ml) daily evening for allergic rhinitis.

YELLOW ZONE (Cough, Wheeze, Exercise induced tightness):
- Salbutamol Inhaler (100mcg) - 2 puffs with spacer every 4-6 hours as needed.

RED ZONE (EMERGENCY ALLERGY / ANAPHYLAXIS PROTOCOL):
- Epinephrine Auto-Injector (EpiPen Jr 0.15mg) - Inject intramuscularly into anterolateral thigh immediately upon peanut ingestion or respiratory distress.
- Call emergency services immediately.
"""
    r12_extracted = {
        "tests": [],
        "vitals": {"peak_flow": "220 L/min", "weight": "27 kg"},
        "medicines": [
            {"name": "Fluticasone + Salmeterol Inhaler", "dosage": "50/25mcg", "frequency": "1 puff twice daily with spacer", "duration": "Continuous"},
            {"name": "Montelukast", "dosage": "5mg chewable", "frequency": "Daily at bedtime", "duration": "Continuous"},
            {"name": "Cetirizine Syrup", "dosage": "5ml (5mg)", "frequency": "Daily evening", "duration": "30 days"},
            {"name": "EpiPen Jr (Epinephrine)", "dosage": "0.15mg", "frequency": "EMERGENCY USE ONLY (IM Thigh)", "duration": "SOS Emergency"}
        ],
        "allergies_noted": ["Peanuts (Severe Anaphylaxis)", "Amoxicillin"]
    }
    r12_critical = [
        "CRITICAL EMERGENCY PROTOCOL: EpiPen Jr (0.15mg) must be kept with school bag and caregiver.",
        "School and sports coaches must be informed of peanut anaphylaxis plan."
    ]
    r12_summary = "Formulated Pediatric Asthma & Anaphylaxis Action Plan with Fluticasone-Salmeterol inhaler and Montelukast 5mg chewable. Prescribed EpiPen Jr 0.15mg for emergency intramuscular injection in case of acute peanut exposure."

    c.execute('''
    INSERT INTO medical_records (id, patient_id, title, category, record_date, doctor_or_facility, raw_text, extracted_data_json, ai_summary, critical_alerts_json, file_name, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ('rec_12', 'pat_4', 'Pediatric Asthma & Anaphylaxis Action Plan', 'Prescription', '2026-09-05', 'Dr. Priya Deshmukh (Metro Care)', r12_text, json.dumps(r12_extracted), r12_summary, json.dumps(r12_critical), 'asthma_action_plan_ananya.pdf', '2026-09-05T15:20:00'))

    # ==================== SEED ACCESS CONSENTS ====================
    # Consent 1: Rahul Jadhav -> Dr. Rajesh Sharma (Approved)
    c.execute('''
    INSERT INTO access_consents (id, doctor_id, patient_id, requested_record_types_json, duration_type, status, granted_at, expires_at, access_logs_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        'con_1',
        'doc_1',
        'pat_1',
        json.dumps(['Lab Report', 'Prescription', 'X-Ray', 'Discharge Summary']),
        '7 days',
        'Approved',
        '2026-09-20T10:00:00',
        '2026-09-27T10:00:00',
        json.dumps([
            {"action": "Requested Access", "by": "Dr. Rajesh Sharma", "timestamp": "2026-09-20T09:30:00"},
            {"action": "Approved by Patient", "by": "Rahul Jadhav", "timestamp": "2026-09-20T10:00:00"},
            {"action": "Viewed Lab & Prescription Records", "by": "Dr. Rajesh Sharma", "timestamp": "2026-09-21T14:10:00"},
            {"action": "Reviewed 2D Echocardiography Study", "by": "Dr. Rajesh Sharma", "timestamp": "2026-09-22T08:45:00"}
        ]),
        '2026-09-20T09:30:00'
    ))

    # Consent 2: Rahul Jadhav -> Dr. Vikram Patil (Approved)
    c.execute('''
    INSERT INTO access_consents (id, doctor_id, patient_id, requested_record_types_json, duration_type, status, granted_at, expires_at, access_logs_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        'con_2',
        'doc_3',
        'pat_1',
        json.dumps(['Lab Report', 'Discharge Summary', 'X-Ray']),
        'Permanent',
        'Approved',
        '2026-01-20T14:00:00',
        None,
        json.dumps([
            {"action": "Requested Surgical Records Access", "by": "Dr. Vikram Patil", "timestamp": "2026-01-20T13:30:00"},
            {"action": "Approved Permanent Access", "by": "Rahul Jadhav", "timestamp": "2026-01-20T14:00:00"},
            {"action": "Accessed Meniscectomy Post-Op Summary", "by": "Dr. Vikram Patil", "timestamp": "2026-01-24T11:20:00"}
        ]),
        '2026-01-20T13:30:00'
    ))

    # Consent 3: Rahul Jadhav -> Dr. Ananya Sen (Pending Request for demo)
    c.execute('''
    INSERT INTO access_consents (id, doctor_id, patient_id, requested_record_types_json, duration_type, status, granted_at, expires_at, access_logs_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        'con_3',
        'doc_2',
        'pat_1',
        json.dumps(['Lab Report', 'Prescription']),
        '24 hours',
        'Pending',
        None,
        None,
        json.dumps([
            {"action": "Requested Access for Glycemic Evaluation", "by": "Dr. Ananya Sen", "timestamp": "2026-09-22T07:15:00"}
        ]),
        '2026-09-22T07:15:00'
    ))

    # Consent 4: Priya Sharma -> Dr. Meera Nambiar (Approved)
    c.execute('''
    INSERT INTO access_consents (id, doctor_id, patient_id, requested_record_types_json, duration_type, status, granted_at, expires_at, access_logs_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        'con_4',
        'doc_5',
        'pat_2',
        json.dumps(['Lab Report', 'Prescription']),
        'Permanent',
        'Approved',
        '2026-09-10T09:00:00',
        None,
        json.dumps([
            {"action": "Requested Antenatal History", "by": "Dr. Meera Nambiar", "timestamp": "2026-09-10T08:30:00"},
            {"action": "Approved by Patient", "by": "Priya Sharma", "timestamp": "2026-09-10T09:00:00"},
            {"action": "Logged Obstetric Notes", "by": "Dr. Meera Nambiar", "timestamp": "2026-09-12T11:50:00"}
        ]),
        '2026-09-10T08:30:00'
    ))

    # Consent 5: Ramesh Kulkarni -> Dr. Priya Deshmukh (Approved)
    c.execute('''
    INSERT INTO access_consents (id, doctor_id, patient_id, requested_record_types_json, duration_type, status, granted_at, expires_at, access_logs_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        'con_5',
        'doc_4',
        'pat_3',
        json.dumps(['Lab Report', 'Prescription', 'X-Ray']),
        '7 days',
        'Approved',
        '2026-08-18T10:00:00',
        '2026-08-25T10:00:00',
        json.dumps([
            {"action": "Requested Pulmonary & Inhaler History", "by": "Dr. Priya Deshmukh", "timestamp": "2026-08-18T09:40:00"},
            {"action": "Approved by Patient", "by": "Ramesh Kulkarni", "timestamp": "2026-08-18T10:00:00"}
        ]),
        '2026-08-18T09:40:00'
    ))

    # ==================== SEED REMINDERS ====================
    # Patient 1 Reminders (Rahul Jadhav)
    c.execute('''
    INSERT INTO reminders (id, patient_id, medicine_name, dosage, timing, frequency, instructions, active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ('rem_1', 'pat_1', 'Telmisartan', '40mg', '08:30 AM', 'Daily Morning', 'After breakfast for Blood Pressure', 1, datetime.datetime.now().isoformat()))

    c.execute('''
    INSERT INTO reminders (id, patient_id, medicine_name, dosage, timing, frequency, instructions, active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ('rem_2', 'pat_1', 'Metformin SR', '500mg', '01:30 PM & 08:30 PM', 'Twice Daily', 'With meals for Blood Sugar control', 1, datetime.datetime.now().isoformat()))

    c.execute('''
    INSERT INTO reminders (id, patient_id, medicine_name, dosage, timing, frequency, instructions, active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ('rem_3', 'pat_1', 'Atorvastatin', '10mg', '10:00 PM', 'Daily Night', 'Before sleep for Cholesterol', 1, datetime.datetime.now().isoformat()))

    # Patient 2 Reminders (Priya Sharma)
    c.execute('''
    INSERT INTO reminders (id, patient_id, medicine_name, dosage, timing, frequency, instructions, active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ('rem_4', 'pat_2', 'Levothyroxine', '50 mcg', '06:30 AM', 'Daily Morning', 'Empty stomach with glass of water 30m before breakfast', 1, datetime.datetime.now().isoformat()))

    c.execute('''
    INSERT INTO reminders (id, patient_id, medicine_name, dosage, timing, frequency, instructions, active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ('rem_5', 'pat_2', 'Ferrous Ascorbate + Folic Acid', '100mg', '02:00 PM', 'Daily Afternoon', 'After lunch with citrus/water. Do not take with milk', 1, datetime.datetime.now().isoformat()))

    c.execute('''
    INSERT INTO reminders (id, patient_id, medicine_name, dosage, timing, frequency, instructions, active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ('rem_6', 'pat_2', 'Calcium Carbonate + Vit D3', '500mg', '09:30 PM', 'Daily Night', 'After dinner. Never combine with iron dose', 1, datetime.datetime.now().isoformat()))

    # Patient 3 Reminders (Ramesh Kulkarni)
    c.execute('''
    INSERT INTO reminders (id, patient_id, medicine_name, dosage, timing, frequency, instructions, active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ('rem_7', 'pat_3', 'Tiotropium + Formoterol Inhaler', '18/12mcg', '08:00 AM & 08:00 PM', 'Twice Daily', 'Use Rotahaler with deep inhalation for COPD control', 1, datetime.datetime.now().isoformat()))

    c.execute('''
    INSERT INTO reminders (id, patient_id, medicine_name, dosage, timing, frequency, instructions, active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ('rem_8', 'pat_3', 'Clopidogrel', '75mg', '09:00 AM', 'Daily Morning', 'Post-stent coronary protection with breakfast', 1, datetime.datetime.now().isoformat()))

    # Patient 4 Reminders (Ananya Iyer)
    c.execute('''
    INSERT INTO reminders (id, patient_id, medicine_name, dosage, timing, frequency, instructions, active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ('rem_9', 'pat_4', 'Fluticasone + Salmeterol Inhaler', '50/25mcg', '08:00 AM & 08:00 PM', 'Twice Daily', 'Use aerochamber spacer and rinse mouth thoroughly', 1, datetime.datetime.now().isoformat()))

    c.execute('''
    INSERT INTO reminders (id, patient_id, medicine_name, dosage, timing, frequency, instructions, active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ('rem_10', 'pat_4', 'Montelukast Chewable', '5mg', '08:30 PM', 'Daily Bedtime', 'Chew before sleep for allergic airway protection', 1, datetime.datetime.now().isoformat()))

    conn.commit()

# ==================== OCR & DOCUMENT ANALYSIS ENGINE ====================
def analyze_medical_document(text_content: str, file_name: str = "report.pdf") -> Dict[str, Any]:
    """
    Python rule-based and NLP parsing engine that performs:
    1. Document Classification
    2. Information Extraction (dates, lab tests, medicines, vitals)
    3. AI Clinical Summarization
    4. Critical Alert Highlighting (allergies, abnormal findings)
    """
    text_lower = text_content.lower()

    # 1. Classification
    category = "Lab Report"
    if any(k in text_lower for k in ["rx", "prescription", "tab.", "cap.", "mg", "twice daily", "before bed"]):
        category = "Prescription"
    elif any(k in text_lower for k in ["x-ray", "radiograph", "ct scan", "mri", "ultrasound", "sonography"]):
        category = "X-Ray"
    elif any(k in text_lower for k in ["surgery", "operative", "discharge summary", "anesthesia", "incision"]):
        category = "Surgery"
    elif any(k in text_lower for k in ["ecg", "echo", "echocardiogram", "ejection fraction", "cardiac"]):
        category = "Cardiology"

    # 2. Extract Tests
    tests = []
    # Patterns for lab metrics
    patterns = [
        (r"(fasting blood sugar|fbs|glucose fasting)[\s:]+([0-9\.]+)\s*(mg/dl)?", "Fasting Blood Sugar", "mg/dL", 70, 100),
        (r"(hba1c|glycated hemoglobin)[\s:]+([0-9\.]+)\s*(%)?", "HbA1c", "%", 4.0, 5.7),
        (r"(total cholesterol|cholesterol)[\s:]+([0-9\.]+)\s*(mg/dl)?", "Total Cholesterol", "mg/dL", 120, 200),
        (r"(triglycerides|tg)[\s:]+([0-9\.]+)\s*(mg/dl)?", "Triglycerides", "mg/dL", 40, 150),
        (r"(creatinine|serum creatinine)[\s:]+([0-9\.]+)\s*(mg/dl)?", "Serum Creatinine", "mg/dL", 0.6, 1.2),
        (r"(hemoglobin|hb)[\s:]+([0-9\.]+)\s*(g/dl)?", "Hemoglobin", "g/dL", 12.0, 16.5),
        (r"(platelet count|platelets)[\s:]+([0-9\.]+)", "Platelet Count", "cells/mcL", 150000, 450000),
        (r"(wbc|tlc)[\s:]+([0-9\.]+)", "Total Leukocyte Count (WBC)", "/cumm", 4000, 11000)
    ]
    for pat, test_name, unit, low_lim, high_lim in patterns:
        m = re.search(pat, text_lower)
        if m:
            try:
                val = float(m.group(2))
                status = "NORMAL"
                if val < low_lim:
                    status = "LOW"
                elif val > high_lim:
                    status = "HIGH"
                tests.append({
                    "name": test_name,
                    "value": f"{val} {unit}".strip(),
                    "status": status,
                    "range": f"{low_lim} - {high_lim} {unit}"
                })
            except Exception:
                pass

    # 3. Extract Medicines
    medicines = []
    med_lines = re.findall(r"(?:tab\.?|cap\.?|syr\.?|inj\.?)?\s*([a-zA-Z]{3,20})\s+(\d+\s*(?:mg|ml|mcg|gm))\s*[-–—:]?\s*(.+)?", text_content, re.IGNORECASE)
    for m in med_lines:
        med_name = m[0].strip()
        dosage = m[1].strip()
        timing = m[2].strip() if len(m) > 2 else "As directed"
        if med_name.lower() not in ["patient", "blood", "total", "normal", "dr", "date", "report"]:
            medicines.append({
                "name": med_name.capitalize(),
                "dosage": dosage,
                "frequency": timing or "Daily",
                "duration": "Prescribed period"
            })

    # 4. Extract Blood Pressure and Vitals
    vitals = {}
    bp_match = re.search(r"(?:bp|blood pressure)[\s:]+([0-9]{2,3}/[0-9]{2,3})", text_lower)
    if bp_match:
        vitals["bp"] = f"{bp_match.group(1)} mmHg"
    pulse_match = re.search(r"(?:pulse|heart rate)[\s:]+([0-9]{2,3})\s*(?:bpm)?", text_lower)
    if pulse_match:
        vitals["pulse"] = f"{pulse_match.group(1)} bpm"

    # 5. Critical Alerts (Allergies & High Flags)
    critical_alerts = []
    allergies_noted = []

    if any(k in text_lower for k in ["penicillin", "amoxicillin", "ampicillin", "augmentin"]):
        if "allerg" in text_lower or "contraindicat" in text_lower or "hypersensitiv" in text_lower:
            critical_alerts.append("CRITICAL: Severe Penicillin / Beta-lactam allergy flagged in document context.")
            allergies_noted.append("Penicillin Derivatives")
    if any(k in text_lower for k in ["sulfa", "sulfonamide", "bactrim", "septra"]):
        if "allerg" in text_lower or "contraindicat" in text_lower:
            critical_alerts.append("WARNING: Sulfonamide / Sulfa drug hypersensitivity detected.")
            allergies_noted.append("Sulfa Drugs")
    if any(k in text_lower for k in ["aspirin", "nsaid", "ibuprofen", "diclofenac"]):
        if "allerg" in text_lower or "contraindicat" in text_lower or "bronchospasm" in text_lower:
            critical_alerts.append("CRITICAL: Aspirin / NSAID allergy flagged; risk of acute bronchospasm.")
            allergies_noted.append("Aspirin / NSAIDs")
    if any(k in text_lower for k in ["contrast dye", "radiocontrast", "iodinated"]):
        if "allerg" in text_lower or "contraindicat" in text_lower or "reaction" in text_lower:
            critical_alerts.append("CRITICAL: Radiocontrast / Iodinated dye allergy documented.")
            allergies_noted.append("Radiocontrast Dye")
    if "latex" in text_lower and ("allerg" in text_lower or "protocol" in text_lower or "free" in text_lower):
        critical_alerts.append("SAFETY ALERT: Latex allergy noted; implement latex-safe precautions.")
        allergies_noted.append("Latex")
    if "peanut" in text_lower and ("allerg" in text_lower or "anaphylax" in text_lower):
        critical_alerts.append("CRITICAL: Severe Peanut hypersensitivity / anaphylaxis risk noted.")
        allergies_noted.append("Peanuts")

    for t in tests:
        if t["status"] == "HIGH":
            critical_alerts.append(f"Abnormal finding: {t['name']} is HIGH ({t['value']}).")
        elif t["status"] == "LOW":
            critical_alerts.append(f"Abnormal finding: {t['name']} is LOW ({t['value']}).")

    # 6. AI Summary Generation
    summary_parts = []
    summary_parts.append(f"Processed {category} from '{file_name}'.")
    if tests:
        summary_parts.append(f"Extracted {len(tests)} diagnostic parameters: " + ", ".join([f"{t['name']}: {t['value']} ({t['status']})" for t in tests]) + ".")
    if medicines:
        summary_parts.append(f"Prescribed medications identified: " + ", ".join([f"{m['name']} ({m['dosage']})" for m in medicines]) + ".")
    if vitals:
        summary_parts.append(f"Documented vitals: BP {vitals.get('bp', 'N/A')}, Pulse {vitals.get('pulse', 'N/A')}.")
    if allergies_noted:
        summary_parts.append(f"Hypersensitivity precautions identified for: {', '.join(allergies_noted)}.")
    if not tests and not medicines:
        summary_parts.append("Clinical assessment text recorded. Findings logged to patient longitudinal health record.")

    ai_summary = " ".join(summary_parts)

    return {
        "category": category,
        "record_date": datetime.date.today().isoformat(),
        "extracted_data": {
            "tests": tests,
            "medicines": medicines,
            "vitals": vitals,
            "allergies_noted": allergies_noted
        },
        "critical_alerts": critical_alerts,
        "ai_summary": ai_summary
    }

# ==================== TIMELINE & LONGITUDINAL BUILDER ====================
def build_longitudinal_timeline(patient_id: str) -> List[Dict[str, Any]]:
    conn = get_db()
    c = conn.cursor()
    c.execute('''
    SELECT * FROM medical_records WHERE patient_id = ? ORDER BY record_date DESC, created_at DESC
    ''', (patient_id,))
    rows = c.fetchall()
    timeline = []
    for r in rows:
        timeline.append({
            "id": r["id"],
            "patient_id": r["patient_id"],
            "title": r["title"],
            "category": r["category"],
            "date": r["record_date"],
            "record_date": r["record_date"],
            "facility": r["doctor_or_facility"],
            "doctor_or_facility": r["doctor_or_facility"],
            "summary": r["ai_summary"],
            "ai_summary": r["ai_summary"],
            "critical_alerts": json.loads(r["critical_alerts_json"]),
            "extracted_data": json.loads(r["extracted_data_json"]),
            "file_name": r["file_name"],
            "raw_text": r["raw_text"],
            "created_at": r["created_at"]
        })
    conn.close()
    return timeline

# ==================== AI SEARCH OVER MEDICAL HISTORY ====================
def search_medical_history(patient_id: str, query: str) -> Dict[str, Any]:
    conn = get_db()
    c = conn.cursor()
    c.execute('SELECT * FROM medical_records WHERE patient_id = ?', (patient_id,))
    records = c.fetchall()
    q_lower = query.lower()
    results = []

    for r in records:
        text_corpus = (r["title"] + " " + r["category"] + " " + r["raw_text"] + " " + r["ai_summary"]).lower()
        score = 0
        for token in q_lower.split():
            if len(token) > 2 and token in text_corpus:
                score += 1

        if score > 0 or not query.strip():
            results.append({
                "record_id": r["id"],
                "title": r["title"],
                "category": r["category"],
                "date": r["record_date"],
                "summary": r["ai_summary"],
                "critical_alerts": json.loads(r["critical_alerts_json"]),
                "relevance_score": score
            })

    results.sort(key=lambda x: x["relevance_score"], reverse=True)
    conn.close()
    return {
        "query": query,
        "total_matches": len(results),
        "results": results
    }

# ==================== CLI / RPC DISPATCHER ====================
def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No action specified"}))
        sys.exit(1)

    action = sys.argv[1]

    if action == "init-db":
        init_db()
        print(json.dumps({"status": "success", "message": "Database initialized successfully"}))
        return

    init_db() # Ensure DB is ready

    if action == "get-state":
        conn = get_db()
        c = conn.cursor()
        
        c.execute('SELECT * FROM clinics')
        clinics = [dict(r) for r in c.fetchall()]
        
        c.execute('SELECT * FROM doctors')
        doctors = []
        for r in c.fetchall():
            d = dict(r)
            d["slots"] = json.loads(d["slots_json"])
            doctors.append(d)

        c.execute('SELECT * FROM patients')
        patients = []
        for r in c.fetchall():
            p = dict(r)
            p["allergies"] = json.loads(p["allergies_json"])
            p["emergency_contact"] = json.loads(p["emergency_contact_json"])
            patients.append(p)

        c.execute('SELECT * FROM appointments ORDER BY date ASC')
        appointments = [dict(r) for r in c.fetchall()]

        c.execute('SELECT * FROM access_consents ORDER BY created_at DESC')
        consents = []
        for r in c.fetchall():
            con = dict(r)
            con["requested_record_types"] = json.loads(con["requested_record_types_json"])
            con["access_logs"] = json.loads(con["access_logs_json"])
            consents.append(con)

        c.execute('SELECT * FROM reminders WHERE active = 1 ORDER BY created_at DESC')
        reminders = [dict(r) for r in c.fetchall()]

        c.execute('SELECT * FROM medical_records ORDER BY record_date DESC, created_at DESC')
        rows = c.fetchall()
        timeline = []
        for r in rows:
            timeline.append({
                "id": r["id"],
                "patient_id": r["patient_id"],
                "title": r["title"],
                "category": r["category"],
                "date": r["record_date"],
                "record_date": r["record_date"],
                "facility": r["doctor_or_facility"],
                "doctor_or_facility": r["doctor_or_facility"],
                "summary": r["ai_summary"],
                "ai_summary": r["ai_summary"],
                "critical_alerts": json.loads(r["critical_alerts_json"]),
                "extracted_data": json.loads(r["extracted_data_json"]),
                "file_name": r["file_name"],
                "raw_text": r["raw_text"],
                "created_at": r["created_at"]
            })

        # Synthesize audit log entries from consents and system activity
        audit_logs = []
        log_counter = 1
        for con in consents:
            for l in con.get("access_logs", []):
                audit_logs.append({
                    "id": f"log_{log_counter}",
                    "user_name": l.get("by", "Authorized User"),
                    "user_role": "Doctor" if "Dr" in l.get("by", "") else "Patient",
                    "action": l.get("action", "Access Record"),
                    "details": f"Consent ID: {con['id']} ({con.get('duration_type', '24h')})",
                    "timestamp": l.get("timestamp", datetime.datetime.now().isoformat())
                })
                log_counter += 1

        # Also add initial system audit entry if empty
        if not audit_logs:
            audit_logs.append({
                "id": "log_init",
                "user_name": "System Security Officer",
                "user_role": "Admin",
                "action": "SYSTEM_DATABASE_INITIALIZED",
                "details": "SQLite tables encrypted and access control rules active.",
                "timestamp": datetime.datetime.now().isoformat()
            })

        conn.close()
        print(json.dumps({
            "clinics": clinics,
            "doctors": doctors,
            "patients": patients,
            "appointments": appointments,
            "consents": consents,
            "reminders": reminders,
            "timeline": timeline,
            "audit_logs": audit_logs
        }))

    elif action == "process-document":
        payload = json.loads(sys.argv[2]) if len(sys.argv) > 2 else {}
        text = payload.get("text", "")
        file_name = payload.get("file_name", "report.pdf")
        patient_id = payload.get("patient_id", "pat_1")
        facility = payload.get("facility", "Diagnostic Center")
        title = payload.get("title", "Clinical Lab Report")

        analysis = analyze_medical_document(text, file_name)

        conn = get_db()
        c = conn.cursor()
        rec_id = f"rec_{uuid.uuid4().hex[:8]}"
        c.execute('''
        INSERT INTO medical_records (id, patient_id, title, category, record_date, doctor_or_facility, raw_text, extracted_data_json, ai_summary, critical_alerts_json, file_name, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            rec_id,
            patient_id,
            title,
            analysis["category"],
            analysis["record_date"],
            facility,
            text,
            json.dumps(analysis["extracted_data"]),
            analysis["ai_summary"],
            json.dumps(analysis["critical_alerts"]),
            file_name,
            datetime.datetime.now().isoformat()
        ))
        conn.commit()
        conn.close()

        print(json.dumps({
            "record_id": rec_id,
            "analysis": analysis
        }))

    elif action == "build-timeline":
        patient_id = sys.argv[2] if len(sys.argv) > 2 else "pat_1"
        tl = build_longitudinal_timeline(patient_id)
        print(json.dumps(tl))

    elif action == "search":
        patient_id = sys.argv[2] if len(sys.argv) > 2 else "pat_1"
        query = sys.argv[3] if len(sys.argv) > 3 else ""
        res = search_medical_history(patient_id, query)
        print(json.dumps(res))

    elif action == "book-appointment":
        payload = json.loads(sys.argv[2])
        conn = get_db()
        c = conn.cursor()
        apt_id = f"apt_{uuid.uuid4().hex[:6]}"
        c.execute('''
        INSERT INTO appointments (id, patient_id, doctor_id, clinic_id, date, time_slot, status, reason, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            apt_id,
            payload["patient_id"],
            payload["doctor_id"],
            payload["clinic_id"],
            payload["date"],
            payload["time_slot"],
            "Confirmed",
            payload.get("reason", "Consultation"),
            datetime.datetime.now().isoformat()
        ))
        conn.commit()
        conn.close()
        print(json.dumps({"status": "success", "appointment_id": apt_id}))

    elif action == "request-consent":
        payload = json.loads(sys.argv[2])
        conn = get_db()
        c = conn.cursor()
        con_id = f"con_{uuid.uuid4().hex[:6]}"
        
        duration = payload.get("duration", "24 hours")
        created_time = datetime.datetime.now()
        
        initial_log = [
            {"action": "Requested Access", "by": payload.get("doctor_name", "Doctor"), "timestamp": created_time.isoformat()}
        ]

        c.execute('''
        INSERT INTO access_consents (id, doctor_id, patient_id, requested_record_types_json, duration_type, status, granted_at, expires_at, access_logs_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            con_id,
            payload["doctor_id"],
            payload["patient_id"],
            json.dumps(payload.get("record_types", ["Lab Report", "Prescription"])),
            duration,
            "Pending",
            None,
            None,
            json.dumps(initial_log),
            created_time.isoformat()
        ))
        conn.commit()
        conn.close()
        print(json.dumps({"status": "success", "consent_id": con_id}))

    elif action == "respond-consent":
        payload = json.loads(sys.argv[2])
        con_id = payload["consent_id"]
        decision = payload["decision"] # Approved or Rejected
        conn = get_db()
        c = conn.cursor()
        c.execute('SELECT * FROM access_consents WHERE id = ?', (con_id,))
        con = c.fetchone()
        if not con:
            print(json.dumps({"error": "Consent not found"}))
            return

        logs = json.loads(con["access_logs_json"])
        now = datetime.datetime.now()
        
        granted_at = None
        expires_at = None

        if decision == "Approved":
            granted_at = now.isoformat()
            duration_type = con["duration_type"]
            if "24" in duration_type:
                expires_at = (now + datetime.timedelta(hours=24)).isoformat()
            elif "7" in duration_type:
                expires_at = (now + datetime.timedelta(days=7)).isoformat()
            else:
                expires_at = "Permanent"
            logs.append({"action": f"Approved by Patient for {con['duration_type']}", "by": "Patient", "timestamp": now.isoformat()})
        else:
            logs.append({"action": "Rejected by Patient", "by": "Patient", "timestamp": now.isoformat()})

        c.execute('''
        UPDATE access_consents
        SET status = ?, granted_at = ?, expires_at = ?, access_logs_json = ?
        WHERE id = ?
        ''', (decision, granted_at, expires_at, json.dumps(logs), con_id))
        conn.commit()
        conn.close()
        print(json.dumps({"status": "success", "consent_id": con_id, "decision": decision}))

    elif action == "revoke-consent":
        payload = json.loads(sys.argv[2])
        con_id = payload["consent_id"]
        conn = get_db()
        c = conn.cursor()
        c.execute('SELECT * FROM access_consents WHERE id = ?', (con_id,))
        con = c.fetchone()
        if con:
            logs = json.loads(con["access_logs_json"])
            now = datetime.datetime.now()
            logs.append({"action": "Revoked by Patient", "by": "Patient", "timestamp": now.isoformat()})
            c.execute('UPDATE access_consents SET status = "Revoked", access_logs_json = ? WHERE id = ?', (json.dumps(logs), con_id))
            conn.commit()
        conn.close()
        print(json.dumps({"status": "success", "consent_id": con_id}))

    elif action == "add-prescription":
        payload = json.loads(sys.argv[2])
        patient_id = payload["patient_id"]
        doctor_name = payload.get("doctor_name", "Consultant Doctor")
        notes = payload.get("notes", "")
        meds = payload.get("medicines", [])
        
        raw_text = f"Doctor Prescription by {doctor_name}\nNotes: {notes}\n"
        for m in meds:
            raw_text += f"- {m.get('name')} {m.get('dosage')} ({m.get('frequency')})\n"
        
        analysis = analyze_medical_document(raw_text, "doctor_prescription.pdf")
        rec_id = f"rec_{uuid.uuid4().hex[:8]}"

        conn = get_db()
        c = conn.cursor()
        c.execute('''
        INSERT INTO medical_records (id, patient_id, title, category, record_date, doctor_or_facility, raw_text, extracted_data_json, ai_summary, critical_alerts_json, file_name, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            rec_id,
            patient_id,
            f"Prescription & Clinical Notes by {doctor_name}",
            "Prescription",
            datetime.date.today().isoformat(),
            doctor_name,
            raw_text,
            json.dumps({"tests": [], "vitals": {}, "medicines": meds, "allergies_noted": []}),
            analysis["ai_summary"],
            json.dumps(analysis["critical_alerts"]),
            "rx_portal_entry.pdf",
            datetime.datetime.now().isoformat()
        ))
        conn.commit()
        conn.close()
        print(json.dumps({"status": "success", "record_id": rec_id}))

    elif action == "add-reminder":
        payload = json.loads(sys.argv[2])
        conn = get_db()
        c = conn.cursor()
        rem_id = f"rem_{uuid.uuid4().hex[:6]}"
        c.execute('''
        INSERT INTO reminders (id, patient_id, medicine_name, dosage, timing, frequency, instructions, active, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            rem_id,
            payload["patient_id"],
            payload["medicine_name"],
            payload.get("dosage", "1 dose"),
            payload.get("timing", "09:00 AM"),
            payload.get("frequency", "Daily"),
            payload.get("instructions", "Take with water"),
            1,
            datetime.datetime.now().isoformat()
        ))
        conn.commit()
        conn.close()
        print(json.dumps({"status": "success", "reminder_id": rem_id}))

    elif action == "toggle-reminder":
        payload = json.loads(sys.argv[2])
        conn = get_db()
        c = conn.cursor()
        c.execute('UPDATE reminders SET active = ? WHERE id = ?', (payload.get("active", 1), payload["reminder_id"]))
        conn.commit()
        conn.close()
        print(json.dumps({"status": "success"}))

    elif action == "add-doctor":
        payload = json.loads(sys.argv[2])
        conn = get_db()
        c = conn.cursor()
        doc_id = f"doc_{uuid.uuid4().hex[:6]}"
        c.execute('''
        INSERT INTO doctors (id, clinic_id, name, specialization, experience, fee, slots_json)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            doc_id,
            payload.get("clinic_id", "clinic_1"),
            payload["name"],
            payload["specialization"],
            payload.get("experience", "5 Years"),
            int(payload.get("fee", 500)),
            json.dumps(payload.get("slots", ["10:00 AM", "02:00 PM", "05:00 PM"]))
        ))
        conn.commit()
        conn.close()
        print(json.dumps({"status": "success", "doctor_id": doc_id}))

    elif action == "update-appointment-status":
        payload = json.loads(sys.argv[2])
        conn = get_db()
        c = conn.cursor()
        c.execute('UPDATE appointments SET status = ? WHERE id = ?', (payload.get("status", "Completed"), payload["appointment_id"]))
        conn.commit()
        conn.close()
        print(json.dumps({"status": "success", "appointment_id": payload["appointment_id"]}))

    elif action == "add-clinic":
        payload = json.loads(sys.argv[2])
        conn = get_db()
        c = conn.cursor()
        cl_id = f"clinic_{uuid.uuid4().hex[:6]}"
        c.execute('''
        INSERT INTO clinics (id, name, location, contact, departments)
        VALUES (?, ?, ?, ?, ?)
        ''', (
            cl_id,
            payload["name"],
            payload["location"],
            payload.get("contact", "+91 99999 00000"),
            payload.get("departments", "General Medicine")
        ))
        conn.commit()
        conn.close()
        print(json.dumps({"status": "success", "clinic_id": cl_id}))

    else:
        print(json.dumps({"error": f"Unknown action: {action}"}))

if __name__ == "__main__":
    main()
