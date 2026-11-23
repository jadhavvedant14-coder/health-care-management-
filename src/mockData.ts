import { AppState } from "./types";

export const initialFallbackState: AppState = {
  "clinics": [
    {
      "id": "clinic_1",
      "name": "City Health Super-Speciality Hospital",
      "location": "Connaught Place, New Delhi / Pune Branch",
      "contact": "+91 98200 12345",
      "departments": "Cardiology, Pathology, Orthopedics, General Medicine, Nephrology"
    },
    {
      "id": "clinic_2",
      "name": "Metro Care Diagnostic & Polyclinic",
      "location": "Andheri West, Mumbai",
      "contact": "+91 98211 54321",
      "departments": "Diagnostics, Pediatrics, Internal Medicine, Pulmonology"
    },
    {
      "id": "clinic_3",
      "name": "Apex Women & Child Care Hospital",
      "location": "Koramangala, Bengaluru",
      "contact": "+91 98800 99881",
      "departments": "Obstetrics, Pediatrics, Endocrinology, Neonatology"
    }
  ],
  "doctors": [
    {
      "id": "doc_1",
      "clinic_id": "clinic_1",
      "name": "Dr. Rajesh Sharma, MD",
      "specialization": "Cardiologist",
      "experience": "14 Years",
      "fee": 800,
      "slots_json": "[\"10:00 AM\", \"11:30 AM\", \"02:00 PM\", \"04:30 PM\"]",
      "slots": [
        "10:00 AM",
        "11:30 AM",
        "02:00 PM",
        "04:30 PM"
      ]
    },
    {
      "id": "doc_2",
      "clinic_id": "clinic_1",
      "name": "Dr. Ananya Sen, MBBS, DNB",
      "specialization": "General Physician & Diabetologist",
      "experience": "9 Years",
      "fee": 600,
      "slots_json": "[\"09:00 AM\", \"11:00 AM\", \"03:00 PM\", \"05:00 PM\"]",
      "slots": [
        "09:00 AM",
        "11:00 AM",
        "03:00 PM",
        "05:00 PM"
      ]
    },
    {
      "id": "doc_3",
      "clinic_id": "clinic_2",
      "name": "Dr. Vikram Patil, MS (Ortho)",
      "specialization": "Orthopedic Surgeon",
      "experience": "12 Years",
      "fee": 900,
      "slots_json": "[\"10:30 AM\", \"01:00 PM\", \"04:00 PM\"]",
      "slots": [
        "10:30 AM",
        "01:00 PM",
        "04:00 PM"
      ]
    },
    {
      "id": "doc_4",
      "clinic_id": "clinic_2",
      "name": "Dr. Priya Deshmukh, MD (Pulmonology)",
      "specialization": "Pulmonologist",
      "experience": "11 Years",
      "fee": 850,
      "slots_json": "[\"09:30 AM\", \"12:00 PM\", \"03:30 PM\"]",
      "slots": [
        "09:30 AM",
        "12:00 PM",
        "03:30 PM"
      ]
    },
    {
      "id": "doc_5",
      "clinic_id": "clinic_3",
      "name": "Dr. Meera Nambiar, MD, DGO",
      "specialization": "Obstetrician & Gynecologist",
      "experience": "16 Years",
      "fee": 950,
      "slots_json": "[\"10:00 AM\", \"11:30 AM\", \"02:30 PM\", \"05:00 PM\"]",
      "slots": [
        "10:00 AM",
        "11:30 AM",
        "02:30 PM",
        "05:00 PM"
      ]
    }
  ],
  "patients": [
    {
      "id": "pat_1",
      "name": "Rahul Jadhav",
      "age": 38,
      "gender": "Male",
      "phone": "+91 98765 43210",
      "email": "jadhavvedant14@gmail.com",
      "blood_group": "B+ Positive",
      "allergies_json": "[\"Penicillin (Severe Rash / Anaphylaxis Risk)\", \"Sulfa Drugs\"]",
      "emergency_contact_json": "{\"name\": \"Sunita Jadhav (Spouse)\", \"relation\": \"Spouse\", \"phone\": \"+91 98765 43211\"}",
      "qr_token": "QR_EMERGENCY_RAHUL_B_POS",
      "allergies": [
        "Penicillin (Severe Rash / Anaphylaxis Risk)",
        "Sulfa Drugs"
      ],
      "emergency_contact": {
        "name": "Sunita Jadhav (Spouse)",
        "relation": "Spouse",
        "phone": "+91 98765 43211"
      }
    },
    {
      "id": "pat_2",
      "name": "Priya Sharma",
      "age": 32,
      "gender": "Female",
      "phone": "+91 98111 22334",
      "email": "priya.sharma@example.com",
      "blood_group": "O+ Positive",
      "allergies_json": "[\"Aspirin (Asthma trigger / Bronchospasm)\", \"NSAIDs\"]",
      "emergency_contact_json": "{\"name\": \"Amit Sharma (Husband)\", \"relation\": \"Spouse\", \"phone\": \"+91 98111 22335\"}",
      "qr_token": "QR_EMERGENCY_PRIYA_O_POS",
      "allergies": [
        "Aspirin (Asthma trigger / Bronchospasm)",
        "NSAIDs"
      ],
      "emergency_contact": {
        "name": "Amit Sharma (Husband)",
        "relation": "Spouse",
        "phone": "+91 98111 22335"
      }
    },
    {
      "id": "pat_3",
      "name": "Ramesh Kulkarni",
      "age": 64,
      "gender": "Male",
      "phone": "+91 97654 32109",
      "email": "ramesh.kulkarni@example.com",
      "blood_group": "A+ Positive",
      "allergies_json": "[\"Iodinated Contrast Dye\", \"Latex\"]",
      "emergency_contact_json": "{\"name\": \"Nikhil Kulkarni (Son)\", \"relation\": \"Son\", \"phone\": \"+91 97654 32110\"}",
      "qr_token": "QR_EMERGENCY_RAMESH_A_POS",
      "allergies": [
        "Iodinated Contrast Dye",
        "Latex"
      ],
      "emergency_contact": {
        "name": "Nikhil Kulkarni (Son)",
        "relation": "Son",
        "phone": "+91 97654 32110"
      }
    },
    {
      "id": "pat_4",
      "name": "Ananya Iyer",
      "age": 9,
      "gender": "Female",
      "phone": "+91 99201 44556",
      "email": "iyer.parents@example.com",
      "blood_group": "AB+ Positive",
      "allergies_json": "[\"Peanuts (Severe Anaphylaxis)\", \"Amoxicillin\"]",
      "emergency_contact_json": "{\"name\": \"Venkatesh Iyer (Father)\", \"relation\": \"Parent\", \"phone\": \"+91 99201 44556\"}",
      "qr_token": "QR_EMERGENCY_ANANYA_AB_POS",
      "allergies": [
        "Peanuts (Severe Anaphylaxis)",
        "Amoxicillin"
      ],
      "emergency_contact": {
        "name": "Venkatesh Iyer (Father)",
        "relation": "Parent",
        "phone": "+91 99201 44556"
      }
    }
  ],
  "appointments": [
    {
      "id": "apt_1",
      "patient_id": "pat_1",
      "doctor_id": "doc_1",
      "clinic_id": "clinic_1",
      "date": "2026-09-25",
      "time_slot": "11:30 AM",
      "status": "Confirmed",
      "reason": "Routine hypertension & lipid panel follow-up",
      "created_at": "2026-09-22T11:41:08.657976"
    },
    {
      "id": "apt_3",
      "patient_id": "pat_2",
      "doctor_id": "doc_5",
      "clinic_id": "clinic_3",
      "date": "2026-09-26",
      "time_slot": "10:00 AM",
      "status": "Confirmed",
      "reason": "Third trimester prenatal evaluation & OGTT review",
      "created_at": "2026-09-22T11:41:08.658080"
    },
    {
      "id": "apt_7",
      "patient_id": "pat_4",
      "doctor_id": "doc_4",
      "clinic_id": "clinic_2",
      "date": "2026-09-27",
      "time_slot": "09:30 AM",
      "status": "Confirmed",
      "reason": "Pediatric asthma trigger evaluation & peak flow meter check",
      "created_at": "2026-09-22T11:41:08.658097"
    },
    {
      "id": "apt_5",
      "patient_id": "pat_3",
      "doctor_id": "doc_4",
      "clinic_id": "clinic_2",
      "date": "2026-09-28",
      "time_slot": "12:00 PM",
      "status": "Confirmed",
      "reason": "COPD spirometry follow-up and inhaler review",
      "created_at": "2026-09-22T11:41:08.658089"
    },
    {
      "id": "apt_4",
      "patient_id": "pat_2",
      "doctor_id": "doc_2",
      "clinic_id": "clinic_1",
      "date": "2026-09-30",
      "time_slot": "11:00 AM",
      "status": "Confirmed",
      "reason": "Thyroid dosage adjustment & fasting glucose monitoring",
      "created_at": "2026-09-22T11:41:08.658084"
    },
    {
      "id": "apt_2",
      "patient_id": "pat_1",
      "doctor_id": "doc_3",
      "clinic_id": "clinic_2",
      "date": "2026-10-02",
      "time_slot": "10:30 AM",
      "status": "Confirmed",
      "reason": "Right knee arthroscopy recovery & physiotherapy evaluation",
      "created_at": "2026-09-22T11:41:08.658071"
    },
    {
      "id": "apt_6",
      "patient_id": "pat_3",
      "doctor_id": "doc_1",
      "clinic_id": "clinic_1",
      "date": "2026-10-05",
      "time_slot": "02:00 PM",
      "status": "Confirmed",
      "reason": "Annual 2D Echo and post-stent cardiac evaluation",
      "created_at": "2026-09-22T11:41:08.658093"
    }
  ],
  "consents": [
    {
      "id": "con_3",
      "doctor_id": "doc_2",
      "patient_id": "pat_1",
      "requested_record_types_json": "[\"Lab Report\", \"Prescription\"]",
      "duration_type": "24 hours",
      "status": "Pending",
      "granted_at": null,
      "expires_at": null,
      "access_logs_json": "[{\"action\": \"Requested Access for Glycemic Evaluation\", \"by\": \"Dr. Ananya Sen\", \"timestamp\": \"2026-09-22T07:15:00\"}]",
      "created_at": "2026-09-22T07:15:00",
      "requested_record_types": [
        "Lab Report",
        "Prescription"
      ],
      "access_logs": [
        {
          "action": "Requested Access for Glycemic Evaluation",
          "by": "Dr. Ananya Sen",
          "timestamp": "2026-09-22T07:15:00"
        }
      ]
    },
    {
      "id": "con_1",
      "doctor_id": "doc_1",
      "patient_id": "pat_1",
      "requested_record_types_json": "[\"Lab Report\", \"Prescription\", \"X-Ray\", \"Discharge Summary\"]",
      "duration_type": "7 days",
      "status": "Approved",
      "granted_at": "2026-09-20T10:00:00",
      "expires_at": "2026-09-27T10:00:00",
      "access_logs_json": "[{\"action\": \"Requested Access\", \"by\": \"Dr. Rajesh Sharma\", \"timestamp\": \"2026-09-20T09:30:00\"}, {\"action\": \"Approved by Patient\", \"by\": \"Rahul Jadhav\", \"timestamp\": \"2026-09-20T10:00:00\"}, {\"action\": \"Viewed Lab & Prescription Records\", \"by\": \"Dr. Rajesh Sharma\", \"timestamp\": \"2026-09-21T14:10:00\"}, {\"action\": \"Reviewed 2D Echocardiography Study\", \"by\": \"Dr. Rajesh Sharma\", \"timestamp\": \"2026-09-22T08:45:00\"}]",
      "created_at": "2026-09-20T09:30:00",
      "requested_record_types": [
        "Lab Report",
        "Prescription",
        "X-Ray",
        "Discharge Summary"
      ],
      "access_logs": [
        {
          "action": "Requested Access",
          "by": "Dr. Rajesh Sharma",
          "timestamp": "2026-09-20T09:30:00"
        },
        {
          "action": "Approved by Patient",
          "by": "Rahul Jadhav",
          "timestamp": "2026-09-20T10:00:00"
        },
        {
          "action": "Viewed Lab & Prescription Records",
          "by": "Dr. Rajesh Sharma",
          "timestamp": "2026-09-21T14:10:00"
        },
        {
          "action": "Reviewed 2D Echocardiography Study",
          "by": "Dr. Rajesh Sharma",
          "timestamp": "2026-09-22T08:45:00"
        }
      ]
    },
    {
      "id": "con_4",
      "doctor_id": "doc_5",
      "patient_id": "pat_2",
      "requested_record_types_json": "[\"Lab Report\", \"Prescription\"]",
      "duration_type": "Permanent",
      "status": "Approved",
      "granted_at": "2026-09-10T09:00:00",
      "expires_at": null,
      "access_logs_json": "[{\"action\": \"Requested Antenatal History\", \"by\": \"Dr. Meera Nambiar\", \"timestamp\": \"2026-09-10T08:30:00\"}, {\"action\": \"Approved by Patient\", \"by\": \"Priya Sharma\", \"timestamp\": \"2026-09-10T09:00:00\"}, {\"action\": \"Logged Obstetric Notes\", \"by\": \"Dr. Meera Nambiar\", \"timestamp\": \"2026-09-12T11:50:00\"}]",
      "created_at": "2026-09-10T08:30:00",
      "requested_record_types": [
        "Lab Report",
        "Prescription"
      ],
      "access_logs": [
        {
          "action": "Requested Antenatal History",
          "by": "Dr. Meera Nambiar",
          "timestamp": "2026-09-10T08:30:00"
        },
        {
          "action": "Approved by Patient",
          "by": "Priya Sharma",
          "timestamp": "2026-09-10T09:00:00"
        },
        {
          "action": "Logged Obstetric Notes",
          "by": "Dr. Meera Nambiar",
          "timestamp": "2026-09-12T11:50:00"
        }
      ]
    },
    {
      "id": "con_5",
      "doctor_id": "doc_4",
      "patient_id": "pat_3",
      "requested_record_types_json": "[\"Lab Report\", \"Prescription\", \"X-Ray\"]",
      "duration_type": "7 days",
      "status": "Approved",
      "granted_at": "2026-08-18T10:00:00",
      "expires_at": "2026-08-25T10:00:00",
      "access_logs_json": "[{\"action\": \"Requested Pulmonary & Inhaler History\", \"by\": \"Dr. Priya Deshmukh\", \"timestamp\": \"2026-08-18T09:40:00\"}, {\"action\": \"Approved by Patient\", \"by\": \"Ramesh Kulkarni\", \"timestamp\": \"2026-08-18T10:00:00\"}]",
      "created_at": "2026-08-18T09:40:00",
      "requested_record_types": [
        "Lab Report",
        "Prescription",
        "X-Ray"
      ],
      "access_logs": [
        {
          "action": "Requested Pulmonary & Inhaler History",
          "by": "Dr. Priya Deshmukh",
          "timestamp": "2026-08-18T09:40:00"
        },
        {
          "action": "Approved by Patient",
          "by": "Ramesh Kulkarni",
          "timestamp": "2026-08-18T10:00:00"
        }
      ]
    },
    {
      "id": "con_2",
      "doctor_id": "doc_3",
      "patient_id": "pat_1",
      "requested_record_types_json": "[\"Lab Report\", \"Discharge Summary\", \"X-Ray\"]",
      "duration_type": "Permanent",
      "status": "Approved",
      "granted_at": "2026-01-20T14:00:00",
      "expires_at": null,
      "access_logs_json": "[{\"action\": \"Requested Surgical Records Access\", \"by\": \"Dr. Vikram Patil\", \"timestamp\": \"2026-01-20T13:30:00\"}, {\"action\": \"Approved Permanent Access\", \"by\": \"Rahul Jadhav\", \"timestamp\": \"2026-01-20T14:00:00\"}, {\"action\": \"Accessed Meniscectomy Post-Op Summary\", \"by\": \"Dr. Vikram Patil\", \"timestamp\": \"2026-01-24T11:20:00\"}]",
      "created_at": "2026-01-20T13:30:00",
      "requested_record_types": [
        "Lab Report",
        "Discharge Summary",
        "X-Ray"
      ],
      "access_logs": [
        {
          "action": "Requested Surgical Records Access",
          "by": "Dr. Vikram Patil",
          "timestamp": "2026-01-20T13:30:00"
        },
        {
          "action": "Approved Permanent Access",
          "by": "Rahul Jadhav",
          "timestamp": "2026-01-20T14:00:00"
        },
        {
          "action": "Accessed Meniscectomy Post-Op Summary",
          "by": "Dr. Vikram Patil",
          "timestamp": "2026-01-24T11:20:00"
        }
      ]
    },
    {
      "id": "con_6",
      "doctor_id": "doc_4",
      "patient_id": "pat_4",
      "requested_record_types": [
        "Lab Report",
        "Prescription"
      ],
      "duration_type": "Permanent",
      "status": "Approved",
      "granted_at": "2026-09-06T10:00:00",
      "expires_at": null,
      "access_logs": [
        {
          "action": "Requested Pediatric Allergy History",
          "by": "Dr. Priya Deshmukh",
          "timestamp": "2026-09-06T09:30:00"
        },
        {
          "action": "Approved by Guardian (Venkatesh Iyer)",
          "by": "Guardian",
          "timestamp": "2026-09-06T10:00:00"
        }
      ],
      "created_at": "2026-09-06T09:30:00"
    }
  ],
  "reminders": [
    {
      "id": "rem_10",
      "patient_id": "pat_4",
      "medicine_name": "Montelukast Chewable",
      "dosage": "5mg",
      "timing": "08:30 PM",
      "frequency": "Daily Bedtime",
      "instructions": "Chew before sleep for allergic airway protection",
      "active": 1,
      "created_at": "2026-09-22T11:41:08.658870"
    },
    {
      "id": "rem_9",
      "patient_id": "pat_4",
      "medicine_name": "Fluticasone + Salmeterol Inhaler",
      "dosage": "50/25mcg",
      "timing": "08:00 AM & 08:00 PM",
      "frequency": "Twice Daily",
      "instructions": "Use aerochamber spacer and rinse mouth thoroughly",
      "active": 1,
      "created_at": "2026-09-22T11:41:08.658866"
    },
    {
      "id": "rem_8",
      "patient_id": "pat_3",
      "medicine_name": "Clopidogrel",
      "dosage": "75mg",
      "timing": "09:00 AM",
      "frequency": "Daily Morning",
      "instructions": "Post-stent coronary protection with breakfast",
      "active": 1,
      "created_at": "2026-09-22T11:41:08.658862"
    },
    {
      "id": "rem_7",
      "patient_id": "pat_3",
      "medicine_name": "Tiotropium + Formoterol Inhaler",
      "dosage": "18/12mcg",
      "timing": "08:00 AM & 08:00 PM",
      "frequency": "Twice Daily",
      "instructions": "Use Rotahaler with deep inhalation for COPD control",
      "active": 1,
      "created_at": "2026-09-22T11:41:08.658858"
    },
    {
      "id": "rem_6",
      "patient_id": "pat_2",
      "medicine_name": "Calcium Carbonate + Vit D3",
      "dosage": "500mg",
      "timing": "09:30 PM",
      "frequency": "Daily Night",
      "instructions": "After dinner. Never combine with iron dose",
      "active": 1,
      "created_at": "2026-09-22T11:41:08.658855"
    },
    {
      "id": "rem_5",
      "patient_id": "pat_2",
      "medicine_name": "Ferrous Ascorbate + Folic Acid",
      "dosage": "100mg",
      "timing": "02:00 PM",
      "frequency": "Daily Afternoon",
      "instructions": "After lunch with citrus/water. Do not take with milk",
      "active": 1,
      "created_at": "2026-09-22T11:41:08.658851"
    },
    {
      "id": "rem_4",
      "patient_id": "pat_2",
      "medicine_name": "Levothyroxine",
      "dosage": "50 mcg",
      "timing": "06:30 AM",
      "frequency": "Daily Morning",
      "instructions": "Empty stomach with glass of water 30m before breakfast",
      "active": 1,
      "created_at": "2026-09-22T11:41:08.658846"
    },
    {
      "id": "rem_3",
      "patient_id": "pat_1",
      "medicine_name": "Atorvastatin",
      "dosage": "10mg",
      "timing": "10:00 PM",
      "frequency": "Daily Night",
      "instructions": "Before sleep for Cholesterol",
      "active": 1,
      "created_at": "2026-09-22T11:41:08.658842"
    },
    {
      "id": "rem_2",
      "patient_id": "pat_1",
      "medicine_name": "Metformin SR",
      "dosage": "500mg",
      "timing": "01:30 PM & 08:30 PM",
      "frequency": "Twice Daily",
      "instructions": "With meals for Blood Sugar control",
      "active": 1,
      "created_at": "2026-09-22T11:41:08.658833"
    },
    {
      "id": "rem_1",
      "patient_id": "pat_1",
      "medicine_name": "Telmisartan",
      "dosage": "40mg",
      "timing": "08:30 AM",
      "frequency": "Daily Morning",
      "instructions": "After breakfast for Blood Pressure",
      "active": 1,
      "created_at": "2026-09-22T11:41:08.658762"
    }
  ],
  "timeline": [
    {
      "id": "rec_8",
      "patient_id": "pat_2",
      "title": "Antenatal Week 28 Prescription & Thyroid Plan",
      "category": "Prescription",
      "date": "2026-09-12",
      "record_date": "2026-09-12",
      "facility": "Dr. Meera Nambiar (Apex Women Care)",
      "doctor_or_facility": "Dr. Meera Nambiar (Apex Women Care)",
      "summary": "Antenatal management at 28 weeks: Levothyroxine 50 mcg instituted for TSH optimization, alongside prenatal iron, calcium, and DHA. Strict allergy caution against Aspirin and NSAID medications noted.",
      "ai_summary": "Antenatal management at 28 weeks: Levothyroxine 50 mcg instituted for TSH optimization, alongside prenatal iron, calcium, and DHA. Strict allergy caution against Aspirin and NSAID medications noted.",
      "critical_alerts": [
        "STRICT CONTRAINDICATION: Aspirin and NSAIDs are strictly prohibited due to severe asthma risk.",
        "Separate Iron and Calcium ingestion by at least 4 hours for absorption."
      ],
      "extracted_data": {
        "tests": [],
        "vitals": {
          "bp": "116/74 mmHg",
          "weight": "64 kg"
        },
        "medicines": [
          {
            "name": "Levothyroxine",
            "dosage": "50mcg",
            "frequency": "Daily morning empty stomach",
            "duration": "Throughout pregnancy"
          },
          {
            "name": "Ferrous Ascorbate + Folic Acid",
            "dosage": "100mg/1.5mg",
            "frequency": "Once daily after lunch",
            "duration": "Continuous"
          },
          {
            "name": "Calcium Carbonate + Vit D3",
            "dosage": "500mg",
            "frequency": "Once daily after dinner",
            "duration": "Continuous"
          },
          {
            "name": "DHA & Omega-3",
            "dosage": "200mg",
            "frequency": "Once daily",
            "duration": "Continuous"
          }
        ],
        "allergies_noted": [
          "Aspirin & NSAIDs (Severe Asthma / Bronchospasm)"
        ]
      },
      "file_name": "rx_dr_nambiar_sep2026.pdf",
      "raw_text": "DR. MEERA NAMBIAR, MD, DGO\nApex Women & Child Care Hospital, Bengaluru\nAntenatal Prescription - Gestational Week 28\nPatient: Priya Sharma (32/F) | Date: 12-Sep-2026\nDiagnosis: 28 Weeks Gestation + Subclinical Hypothyroidism\nALLERGIES: Known Severe Aspirin / NSAID allergy (Do not prescribe Aspirin, Ibuprofen, Diclofenac)\n\nPRESCRIPTION:\n1. Tab. Levothyroxine 50 mcg - 1 tablet empty stomach early morning with water (Hypothyroidism)\n2. Tab. Ferrous Ascorbate 100mg + Folic Acid 1.5mg - 1 tablet after lunch (Iron supplementation)\n3. Tab. Calcium Carbonate 500mg + Vit D3 - 1 tablet after dinner (Do not take with Iron)\n4. Cap. DHA & Omega-3 200mg - 1 capsule daily\n\nADVICE:\n- Fetal kick count monitoring daily.\n- Repeat TSH and Hemoglobin in 4 weeks.\n- Avoid all NSAIDs and Aspirin due to bronchospasm history.\n",
      "created_at": "2026-09-12T11:45:00"
    },
    {
      "id": "rec_7",
      "patient_id": "pat_2",
      "title": "Antenatal Panel & Thyroid Evaluation",
      "category": "Lab Report",
      "date": "2026-09-10",
      "record_date": "2026-09-10",
      "facility": "Apex Women Health Lab",
      "doctor_or_facility": "Apex Women Health Lab",
      "summary": "Antenatal screening reveals mild subclinical hypothyroidism with TSH 3.85 mIU/L. Gestational glucose tolerance test normal (OGTT 134 mg/dL). Hemoglobin satisfactory at 11.2 g/dL.",
      "ai_summary": "Antenatal screening reveals mild subclinical hypothyroidism with TSH 3.85 mIU/L. Gestational glucose tolerance test normal (OGTT 134 mg/dL). Hemoglobin satisfactory at 11.2 g/dL.",
      "critical_alerts": [
        "TSH (3.85 mIU/L) above pregnancy 3rd trimester target (< 3.0 mIU/L); Thyroxine dose adjustment required."
      ],
      "extracted_data": {
        "tests": [
          {
            "name": "TSH",
            "value": "3.85 mIU/L",
            "status": "ELEVATED",
            "range": "0.3-3.0"
          },
          {
            "name": "Free T4",
            "value": "1.05 ng/dL",
            "status": "NORMAL",
            "range": "0.8-1.8"
          },
          {
            "name": "Fasting Blood Glucose",
            "value": "92 mg/dL",
            "status": "NORMAL",
            "range": "< 95"
          },
          {
            "name": "2-Hr OGTT",
            "value": "134 mg/dL",
            "status": "NORMAL",
            "range": "< 140"
          },
          {
            "name": "Hemoglobin",
            "value": "11.2 g/dL",
            "status": "NORMAL",
            "range": "11.0-15.0"
          }
        ],
        "vitals": {
          "bp": "118/76 mmHg"
        },
        "medicines": [],
        "allergies_noted": [
          "Aspirin (Bronchospasm)"
        ]
      },
      "file_name": "antenatal_thyroid_sep2026.pdf",
      "raw_text": "APEX WOMEN HEALTH LAB - ANTENATAL & THYROID PROFILE\nPatient: Priya Sharma | Age: 32/F | Gravida 2 Para 1 | Ref By: Dr. Meera Nambiar\nDate: 10-Sep-2026\n\nTEST RESULTS:\n- TSH (Ultrasensitive): 3.85 mIU/L [Trimester 3 Target: 0.3 - 3.0 mIU/L] (ELEVATED)\n- Free T4: 1.05 ng/dL [Normal: 0.8 - 1.8 ng/dL] (NORMAL)\n- Fasting Blood Glucose: 92 mg/dL [Target: < 95 mg/dL] (NORMAL)\n- 2-Hour Post 75g Glucose (OGTT): 134 mg/dL [Target: < 140 mg/dL] (NORMAL)\n- Hemoglobin: 11.2 g/dL [Normal: 11.0 - 15.0 g/dL] (NORMAL)\n- Serum Ferritin: 28 ng/mL [Desirable: > 30 ng/mL] (BORDERLINE LOW)\n- Platelet Count: 240,000 /uL (NORMAL)\n",
      "created_at": "2026-09-10T10:15:00"
    },
    {
      "id": "rec_12",
      "patient_id": "pat_4",
      "title": "Pediatric Asthma & Anaphylaxis Action Plan",
      "category": "Prescription",
      "date": "2026-09-05",
      "record_date": "2026-09-05",
      "facility": "Dr. Priya Deshmukh (Metro Care)",
      "doctor_or_facility": "Dr. Priya Deshmukh (Metro Care)",
      "summary": "Formulated Pediatric Asthma & Anaphylaxis Action Plan with Fluticasone-Salmeterol inhaler and Montelukast 5mg chewable. Prescribed EpiPen Jr 0.15mg for emergency intramuscular injection in case of acute peanut exposure.",
      "ai_summary": "Formulated Pediatric Asthma & Anaphylaxis Action Plan with Fluticasone-Salmeterol inhaler and Montelukast 5mg chewable. Prescribed EpiPen Jr 0.15mg for emergency intramuscular injection in case of acute peanut exposure.",
      "critical_alerts": [
        "CRITICAL EMERGENCY PROTOCOL: EpiPen Jr (0.15mg) must be kept with school bag and caregiver.",
        "School and sports coaches must be informed of peanut anaphylaxis plan."
      ],
      "extracted_data": {
        "tests": [],
        "vitals": {
          "peak_flow": "220 L/min",
          "weight": "27 kg"
        },
        "medicines": [
          {
            "name": "Fluticasone + Salmeterol Inhaler",
            "dosage": "50/25mcg",
            "frequency": "1 puff twice daily with spacer",
            "duration": "Continuous"
          },
          {
            "name": "Montelukast",
            "dosage": "5mg chewable",
            "frequency": "Daily at bedtime",
            "duration": "Continuous"
          },
          {
            "name": "Cetirizine Syrup",
            "dosage": "5ml (5mg)",
            "frequency": "Daily evening",
            "duration": "30 days"
          },
          {
            "name": "EpiPen Jr (Epinephrine)",
            "dosage": "0.15mg",
            "frequency": "EMERGENCY USE ONLY (IM Thigh)",
            "duration": "SOS Emergency"
          }
        ],
        "allergies_noted": [
          "Peanuts (Severe Anaphylaxis)",
          "Amoxicillin"
        ]
      },
      "file_name": "asthma_action_plan_ananya.pdf",
      "raw_text": "DR. PRIYA DESHMUKH, MD (Pulmonology & Pediatric Respiratory)\nMetro Care Polyclinic, Mumbai\nPEDIATRIC ASTHMA & ALLERGY ACTION PLAN\nPatient: Ananya Iyer (9/F) | Date: 05-Sep-2026\nDiagnosis: Moderate Persistent Allergic Asthma & Severe Peanut Anaphylaxis.\n\nDAILY CONTROLLER MEDICATIONS (Green Zone):\n1. Fluticasone + Salmeterol Inhaler (50/25mcg) - 1 puff twice daily with spacer and mouth rinse.\n2. Tab. Montelukast 5mg (Chewable) - 1 tablet daily at bedtime.\n3. Cetirizine Syrup 5mg - 1 teaspoon (5ml) daily evening for allergic rhinitis.\n\nYELLOW ZONE (Cough, Wheeze, Exercise induced tightness):\n- Salbutamol Inhaler (100mcg) - 2 puffs with spacer every 4-6 hours as needed.\n\nRED ZONE (EMERGENCY ALLERGY / ANAPHYLAXIS PROTOCOL):\n- Epinephrine Auto-Injector (EpiPen Jr 0.15mg) - Inject intramuscularly into anterolateral thigh immediately upon peanut ingestion or respiratory distress.\n- Call emergency services immediately.\n",
      "created_at": "2026-09-05T15:20:00"
    },
    {
      "id": "rec_11",
      "patient_id": "pat_4",
      "title": "Pediatric Comprehensive Allergy Panel",
      "category": "Lab Report",
      "date": "2026-09-02",
      "record_date": "2026-09-02",
      "facility": "Metro Pediatrics Allergy Center",
      "doctor_or_facility": "Metro Pediatrics Allergy Center",
      "summary": "Allergy panel confirms marked peanut hypersensitivity (Class 4 IgE 24.5 kUA/L) with severe anaphylaxis potential, dust mite induced allergic asthma, and confirmed Amoxicillin allergy. Total IgE elevated at 480 kU/L.",
      "ai_summary": "Allergy panel confirms marked peanut hypersensitivity (Class 4 IgE 24.5 kUA/L) with severe anaphylaxis potential, dust mite induced allergic asthma, and confirmed Amoxicillin allergy. Total IgE elevated at 480 kU/L.",
      "critical_alerts": [
        "LIFE-THREATENING ALLERGY: Anaphylaxis risk to PEANUTS. Emergency Auto-Injector (EpiPen Jr) must be carried at all times.",
        "Confirmed Amoxicillin allergy. Avoid all penicillin derivatives in pediatric prescriptions."
      ],
      "extracted_data": {
        "tests": [
          {
            "name": "Total Serum IgE",
            "value": "480 kU/L",
            "status": "HIGH",
            "range": "< 100"
          },
          {
            "name": "Peanut Allergen IgE",
            "value": "24.5 kUA/L (Class 4)",
            "status": "HIGH",
            "range": "< 0.35"
          },
          {
            "name": "Dust Mite IgE",
            "value": "8.2 kUA/L",
            "status": "HIGH",
            "range": "< 0.35"
          },
          {
            "name": "Amoxicillin IgE",
            "value": "6.8 kUA/L",
            "status": "HIGH",
            "range": "< 0.35"
          }
        ],
        "vitals": {
          "weight": "27 kg"
        },
        "medicines": [],
        "allergies_noted": [
          "Peanuts (Life-Threatening Anaphylaxis)",
          "Amoxicillin / Penicillin Derivatives"
        ]
      },
      "file_name": "pediatric_allergy_panel_sep2026.pdf",
      "raw_text": "METRO PEDIATRICS ALLERGY & IMMUNOLOGY CENTER\nSERUM SPECIFIC IgE ALLERGY PANEL\nPatient: Ananya Iyer | Age: 9/F | Ref By: Dr. Priya Deshmukh\nDate: 02-Sep-2026\n\nIMMUNOGLOBULIN & ALLERGEN RESULTS:\n- Total Serum IgE: 480 kU/L [Normal for 9 yrs: < 100 kU/L] (VERY HIGH)\n- Peanut Allergen (f13) Specific IgE: 24.5 kUA/L [Class 4 - Very High Reaction] (CRITICAL)\n- House Dust Mite (d1) Specific IgE: 8.2 kUA/L [Class 3 - High Sensitivity]\n- Amoxicillin / Penicilloyl Specific IgE: 6.8 kUA/L [Class 3 - Positive Allergy]\n- Egg White (f1): 0.2 kUA/L [Negative / Low]\n- Milk (f2): 0.3 kUA/L [Negative / Low]\n\nCLINICAL IMPRESSION:\nSevere peanut hypersensitivity with high risk of systemic anaphylaxis. Positive IgE to beta-lactams (Amoxicillin). Moderate aeroallergen reactivity to dust mites exacerbating allergic asthma.\n",
      "created_at": "2026-09-02T11:00:00"
    },
    {
      "id": "rec_10",
      "patient_id": "pat_3",
      "title": "COPD & Cardiac Maintenance Prescription",
      "category": "Prescription",
      "date": "2026-08-20",
      "record_date": "2026-08-20",
      "facility": "Dr. Priya Deshmukh (Metro Care)",
      "doctor_or_facility": "Dr. Priya Deshmukh (Metro Care)",
      "summary": "Prescribed dual bronchodilator Tiotropium+Formoterol, Budesonide inhaler, Clopidogrel 75mg, and Rosuvastatin 20mg for COPD and secondary cardiovascular prevention. Contrast allergy strictly flagged.",
      "ai_summary": "Prescribed dual bronchodilator Tiotropium+Formoterol, Budesonide inhaler, Clopidogrel 75mg, and Rosuvastatin 20mg for COPD and secondary cardiovascular prevention. Contrast allergy strictly flagged.",
      "critical_alerts": [
        "CONTRAST ALLERGY: Must never receive IV radiocontrast without prior nephrology/allergy prep.",
        "Ensure patient rinses mouth after Budesonide inhaler."
      ],
      "extracted_data": {
        "tests": [],
        "vitals": {
          "bp": "130/80 mmHg",
          "spo2": "95%"
        },
        "medicines": [
          {
            "name": "Tiotropium + Formoterol Inhaler",
            "dosage": "18/12mcg",
            "frequency": "2 puffs twice daily",
            "duration": "Continuous"
          },
          {
            "name": "Budesonide Inhaler",
            "dosage": "200mcg",
            "frequency": "1 puff twice daily",
            "duration": "Continuous"
          },
          {
            "name": "Clopidogrel",
            "dosage": "75mg",
            "frequency": "Daily morning",
            "duration": "Continuous"
          },
          {
            "name": "Rosuvastatin",
            "dosage": "20mg",
            "frequency": "Daily night",
            "duration": "Continuous"
          },
          {
            "name": "Levalbuterol SOS",
            "dosage": "50mcg",
            "frequency": "As needed (SOS)",
            "duration": "SOS"
          }
        ],
        "allergies_noted": [
          "Iodinated Contrast Dye (Severe Anaphylactoid Risk)"
        ]
      },
      "file_name": "rx_dr_deshmukh_aug2026.pdf",
      "raw_text": "DR. PRIYA DESHMUKH, MD (Pulmonology)\nMetro Care Diagnostic & Polyclinic, Mumbai\nRx Prescription\nPatient: Ramesh Kulkarni (64/M) | Date: 20-Aug-2026\nDiagnosis: COPD (GOLD Stage 2) & History of Coronary Artery Disease (Post PTCA 2023).\nALLERGIES: Severe reaction to Iodinated Contrast Dye! Late allergy warning.\n\nMEDICATIONS:\n1. Tiotropium + Formoterol Inhaler (18mcg/12mcg) - 2 puffs twice daily using Rotahaler/DPI (Bronchodilation)\n2. Budesonide Inhaler 200mcg - 1 puff twice daily (Rinse mouth after use to prevent candidiasis)\n3. Tab. Clopidogrel 75mg - 1 tablet once daily morning (Anti-platelet)\n4. Tab. Rosuvastatin 20mg - 1 tablet at night (Plaque stabilization)\n5. Levalbuterol Inhaler (50mcg) - 2 puffs SOS for acute breathlessness\n\nADVICE:\n- Annual Influenza & Pneumococcal vaccine recommended.\n- Daily breathing exercises (Pursed-lip breathing).\n- Avoid contrast scans without pre-medication protocol.\n",
      "created_at": "2026-08-20T10:30:00"
    },
    {
      "id": "rec_9",
      "patient_id": "pat_3",
      "title": "Pulmonary Function Test & Spirometry",
      "category": "Lab Report",
      "date": "2026-08-18",
      "record_date": "2026-08-18",
      "facility": "Metro Care Pulmonology Clinic",
      "doctor_or_facility": "Metro Care Pulmonology Clinic",
      "summary": "Spirometry confirms moderate chronic obstructive pulmonary disease (GOLD Stage 2) with FEV1 at 54% of predicted and FEV1/FVC of 56.8%. Resting oxygen saturation 94% on ambient air.",
      "ai_summary": "Spirometry confirms moderate chronic obstructive pulmonary disease (GOLD Stage 2) with FEV1 at 54% of predicted and FEV1/FVC of 56.8%. Resting oxygen saturation 94% on ambient air.",
      "critical_alerts": [
        "GOLD Stage 2 COPD with moderate airflow obstruction (FEV1/FVC 56.8%).",
        "ALLERGY WARNING: Known severe anaphylactoid reaction to Iodinated Contrast Dye."
      ],
      "extracted_data": {
        "tests": [
          {
            "name": "FEV1 % Predicted",
            "value": "54 %",
            "status": "HIGH",
            "range": "> 80%"
          },
          {
            "name": "FEV1/FVC Ratio",
            "value": "56.8 %",
            "status": "HIGH",
            "range": "> 70%"
          },
          {
            "name": "Resting SpO2",
            "value": "94 %",
            "status": "ELEVATED",
            "range": "95-100%"
          }
        ],
        "vitals": {
          "spo2": "94%",
          "pulse": "78 bpm",
          "bp": "134/82 mmHg"
        },
        "medicines": [],
        "allergies_noted": [
          "Iodinated Contrast Dye"
        ]
      },
      "file_name": "pft_spirometry_aug2026.pdf",
      "raw_text": "METRO CARE PULMONOLOGY CLINIC - SPIROMETRY & PFT REPORT\nPatient: Ramesh Kulkarni | Age: 64/M | Ref By: Dr. Priya Deshmukh\nDate: 18-Aug-2026\n\nSPIROMETRY VALUES:\n- FEV1 (Pre-Bronchodilator): 1.62 L (54% of predicted) (MODERATELY REDUCED)\n- FVC: 2.85 L (72% of predicted)\n- FEV1/FVC Ratio: 56.8% [Normal: > 70%] (OBSTRUCTIVE DEFECT)\n- Post-Bronchodilator FEV1: 1.76 L (Improvement 8.6% / 140 ml - Incomplete reversibility)\n- Resting SpO2: 94% on room air\n- Heart Rate: 78 bpm\n\nIMPRESSION:\nModerate chronic airflow limitation compatible with GOLD Stage 2 COPD. Incomplete bronchodilator reversibility. Continue dual bronchodilator therapy (LAMA + LABA).\n",
      "created_at": "2026-08-18T14:10:00"
    },
    {
      "id": "rec_6",
      "patient_id": "pat_1",
      "title": "2D Echocardiography & ECG Report",
      "category": "Lab Report",
      "date": "2026-08-15",
      "record_date": "2026-08-15",
      "facility": "City Health Heart Institute",
      "doctor_or_facility": "City Health Heart Institute",
      "summary": "Normal cardiac systolic function (LVEF 62%). Mild concentric left ventricular hypertrophy and Grade 1 diastolic dysfunction noted secondary to hypertension. No valvular defect.",
      "ai_summary": "Normal cardiac systolic function (LVEF 62%). Mild concentric left ventricular hypertrophy and Grade 1 diastolic dysfunction noted secondary to hypertension. No valvular defect.",
      "critical_alerts": [
        "Mild concentric LV hypertrophy secondary to hypertension; maintain systolic BP < 130 mmHg."
      ],
      "extracted_data": {
        "tests": [
          {
            "name": "LVEF (Ejection Fraction)",
            "value": "62 %",
            "status": "NORMAL",
            "range": "55-70%"
          },
          {
            "name": "IVS (Septal Thickness)",
            "value": "1.15 cm",
            "status": "ELEVATED",
            "range": "0.6-1.1"
          },
          {
            "name": "Diastolic Function",
            "value": "Grade 1 Impairment (E/A 0.9)",
            "status": "ELEVATED",
            "range": "Normal"
          }
        ],
        "vitals": {
          "pulse": "72 bpm"
        },
        "medicines": [],
        "allergies_noted": []
      },
      "file_name": "2d_echo_ecg_aug2026.pdf",
      "raw_text": "CITY HEALTH HEART INSTITUTE - ECHOCARDIOGRAPHY REPORT\nPatient: Rahul Jadhav | Age: 38/M | Ref By: Dr. Rajesh Sharma\nDate: 15-Aug-2026\n\nFINDINGS:\n- Left Ventricle: Normal cavity dimensions. LVIDd: 4.8 cm, LVIDs: 3.1 cm.\n- Left Ventricular Ejection Fraction (LVEF): 62% (Normal systolic function).\n- Interventricular Septum: Mild concentric LV hypertrophy (IVS: 1.15 cm, Normal: < 1.1 cm).\n- Mitral Valve: E/A ratio: 0.9 (Grade 1 Diastolic Relaxation Impairment).\n- Aortic, Tricuspid & Pulmonary Valves: Structurally normal.\n- Pericardium: No pericardial effusion.\n- Resting ECG: Normal sinus rhythm at 72 bpm. Mild left ventricular strain pattern.\n\nIMPRESSION:\nNormal systolic function (LVEF 62%). Mild concentric LV hypertrophy consistent with systemic hypertension. Grade 1 diastolic dysfunction. Good response to anti-hypertensive regimen expected.\n",
      "created_at": "2026-08-15T15:30:00"
    },
    {
      "id": "rec_2",
      "patient_id": "pat_1",
      "title": "Cardiology & Diabetes Prescription",
      "category": "Prescription",
      "date": "2026-08-14",
      "record_date": "2026-08-14",
      "facility": "Dr. Rajesh Sharma (Apollo Clinic)",
      "doctor_or_facility": "Dr. Rajesh Sharma (Apollo Clinic)",
      "summary": "Prescribed Telmisartan 40mg (morning), Metformin 500mg SR (twice daily), and Atorvastatin 10mg (night) for blood pressure, glucose, and dyslipidemia management. Strict warning noted against Penicillin class drugs.",
      "ai_summary": "Prescribed Telmisartan 40mg (morning), Metformin 500mg SR (twice daily), and Atorvastatin 10mg (night) for blood pressure, glucose, and dyslipidemia management. Strict warning noted against Penicillin class drugs.",
      "critical_alerts": [
        "CRITICAL ALLERGY ALERT: Known severe anaphylactic/cutaneous reaction to Penicillin.",
        "Requires daily compliance on Telmisartan, Metformin, and Atorvastatin."
      ],
      "extracted_data": {
        "tests": [],
        "vitals": {
          "bp": "136/84 mmHg"
        },
        "medicines": [
          {
            "name": "Telmisartan",
            "dosage": "40mg",
            "frequency": "Once daily (Morning)",
            "duration": "Continuous"
          },
          {
            "name": "Metformin SR",
            "dosage": "500mg",
            "frequency": "Twice daily (Meals)",
            "duration": "Continuous"
          },
          {
            "name": "Atorvastatin",
            "dosage": "10mg",
            "frequency": "Night (Bedtime)",
            "duration": "Continuous"
          }
        ],
        "allergies_noted": [
          "Penicillin (Severe Rash / Anaphylaxis risk)"
        ]
      },
      "file_name": "rx_dr_sharma_aug2026.jpg",
      "raw_text": "DR. RAJESH SHARMA, MD (Cardiology)\nApollo Clinic & Heart Care, Pune\nRx Prescription\nPatient: Rahul Jadhav (38/M) | Date: 14-Aug-2026\nDiagnosis: Essential Hypertension & Impaired Glucose Tolerance, Dyslipidemia.\nALLERGIES: Severe Penicillin Allergy! (Do NOT prescribe Amoxicillin / Penicillin derivatives)\n\nMEDICATIONS:\n1. Tab. Telmisartan 40mg - 1 tablet once daily morning after breakfast (Hypertension)\n2. Tab. Metformin 500mg SR - 1 tablet twice daily with meals (Glucose control)\n3. Tab. Atorvastatin 10mg - 1 tablet at night before bed (Cholesterol)\n\nADVICE:\n- Restrict dietary sodium (< 2g/day)\n- 30 mins brisk walking daily\n- Repeat HbA1c & Lipid Panel in 3 months\n",
      "created_at": "2026-08-14T11:00:00"
    },
    {
      "id": "rec_1",
      "patient_id": "pat_1",
      "title": "Comprehensive Metabolic & Lipid Panel",
      "category": "Lab Report",
      "date": "2026-08-12",
      "record_date": "2026-08-12",
      "facility": "City Diagnostic Labs",
      "doctor_or_facility": "City Diagnostic Labs",
      "summary": "Fasting blood sugar (128 mg/dL) and HbA1c (7.2%) indicate early diabetes progression. Lipid profile shows elevated total cholesterol and triglycerides with borderline BP 138/88 mmHg. Kidney function normal (Creatinine 0.9 mg/dL).",
      "ai_summary": "Fasting blood sugar (128 mg/dL) and HbA1c (7.2%) indicate early diabetes progression. Lipid profile shows elevated total cholesterol and triglycerides with borderline BP 138/88 mmHg. Kidney function normal (Creatinine 0.9 mg/dL).",
      "critical_alerts": [
        "Elevated HbA1c (7.2%) indicates early type 2 glycemic progression.",
        "Hyperlipidemia: Total Cholesterol (224 mg/dL) & Triglycerides (195 mg/dL) above target."
      ],
      "extracted_data": {
        "tests": [
          {
            "name": "Fasting Blood Sugar",
            "value": "128 mg/dL",
            "status": "ELEVATED",
            "range": "70-100"
          },
          {
            "name": "HbA1c",
            "value": "7.2 %",
            "status": "HIGH",
            "range": "< 5.7%"
          },
          {
            "name": "Total Cholesterol",
            "value": "224 mg/dL",
            "status": "HIGH",
            "range": "< 200"
          },
          {
            "name": "Triglycerides",
            "value": "195 mg/dL",
            "status": "ELEVATED",
            "range": "< 150"
          },
          {
            "name": "Serum Creatinine",
            "value": "0.9 mg/dL",
            "status": "NORMAL",
            "range": "0.7-1.2"
          }
        ],
        "vitals": {
          "bp": "138/88 mmHg",
          "pulse": "74 bpm"
        },
        "medicines": [],
        "allergies_noted": []
      },
      "file_name": "blood_lipid_panel_aug2026.pdf",
      "raw_text": "CITY DIAGNOSTIC LABS - COMPREHENSIVE METABOLIC & LIPID PROFILE\nPatient: Rahul Jadhav | Age: 38 | Sex: M | Ref By: Dr. Rajesh Sharma\nDate: 12-Aug-2026\n\nTEST PARAMETERS:\n- Fasting Blood Sugar (FBS): 128 mg/dL [Normal: 70 - 100 mg/dL] (ELEVATED)\n- HbA1c (Glycated Hemoglobin): 7.2 % [Normal: < 5.7 %, Diabetic: > 6.5 %] (HIGH)\n- Total Cholesterol: 224 mg/dL [Desirable: < 200 mg/dL] (HIGH)\n- Triglycerides: 195 mg/dL [Normal: < 150 mg/dL] (ELEVATED)\n- HDL Cholesterol: 42 mg/dL [Normal: > 40 mg/dL] (NORMAL)\n- LDL Cholesterol: 143 mg/dL [Optimal: < 100 mg/dL] (BORDERLINE HIGH)\n- Serum Creatinine: 0.9 mg/dL [Normal: 0.7 - 1.2 mg/dL] (NORMAL)\n- Blood Pressure: 138/88 mmHg (Stage 1 Hypertension)\n",
      "created_at": "2026-08-12T14:30:00"
    },
    {
      "id": "rec_3",
      "patient_id": "pat_1",
      "title": "Chest X-Ray (PA View)",
      "category": "X-Ray",
      "date": "2026-05-05",
      "record_date": "2026-05-05",
      "facility": "Metro Imaging & Radiology",
      "doctor_or_facility": "Metro Imaging & Radiology",
      "summary": "Normal chest radiograph showing clear lung fields, normal cardiothoracic ratio, and sharp costophrenic angles without effusion or infiltrate.",
      "ai_summary": "Normal chest radiograph showing clear lung fields, normal cardiothoracic ratio, and sharp costophrenic angles without effusion or infiltrate.",
      "critical_alerts": [],
      "extracted_data": {
        "tests": [
          {
            "name": "Cardiothoracic Ratio",
            "value": "Normal",
            "status": "NORMAL",
            "range": "< 0.5"
          }
        ],
        "vitals": {},
        "medicines": [],
        "allergies_noted": []
      },
      "file_name": "chest_xray_may2026.png",
      "raw_text": "METRO IMAGING & RADIOLOGY CENTER\nCHEST X-RAY PA VIEW\nPatient: Rahul Jadhav | Date: 05-May-2026\nFindings:\n- Cardiothoracic ratio is normal (heart size within normal limits).\n- Both lung fields are clear with no focal infiltrates, consolidation or pleural effusion.\n- Costophrenic and cardiophrenic angles are sharp.\n- Bony thorax and soft tissues unremarkable.\nIMPRESSION: Normal Chest Radiograph.\n",
      "created_at": "2026-05-05T09:15:00"
    },
    {
      "id": "rec_5",
      "patient_id": "pat_1",
      "title": "Orthopedic Meniscectomy Discharge Summary",
      "category": "Discharge Summary",
      "date": "2026-01-24",
      "record_date": "2026-01-24",
      "facility": "City Health Hospital - Dr. Vikram Patil",
      "doctor_or_facility": "City Health Hospital - Dr. Vikram Patil",
      "summary": "Successful right knee arthroscopic partial medial meniscectomy. Discharged on Cefuroxime 500mg, Aceclofenac+Paracetamol, and gastroprotective Pantoprazole. Penicillin allergy observed.",
      "ai_summary": "Successful right knee arthroscopic partial medial meniscectomy. Discharged on Cefuroxime 500mg, Aceclofenac+Paracetamol, and gastroprotective Pantoprazole. Penicillin allergy observed.",
      "critical_alerts": [
        "Post-arthroscopic partial meniscectomy right knee. Partial weight bearing for 7 days.",
        "Strictly adhere to Penicillin allergy protocols; Cefuroxime substituted."
      ],
      "extracted_data": {
        "tests": [],
        "vitals": {
          "bp": "124/80 mmHg",
          "pulse": "72 bpm"
        },
        "medicines": [
          {
            "name": "Cefuroxime Axetil",
            "dosage": "500mg",
            "frequency": "Twice daily (5 days)",
            "duration": "5 days"
          },
          {
            "name": "Aceclofenac + Paracetamol",
            "dosage": "100/325mg",
            "frequency": "Twice daily after meals",
            "duration": "5 days"
          },
          {
            "name": "Pantoprazole",
            "dosage": "40mg",
            "frequency": "Daily morning (Empty stomach)",
            "duration": "7 days"
          },
          {
            "name": "Chymoral Forte",
            "dosage": "1 tab",
            "frequency": "Thrice daily",
            "duration": "5 days"
          }
        ],
        "allergies_noted": [
          "Penicillin Allergy (Avoid Augmentin, Amoxicillin)"
        ]
      },
      "file_name": "discharge_summary_meniscectomy.pdf",
      "raw_text": "CITY HEALTH SUPER-SPECIALITY HOSPITAL\nDEPARTMENT OF ORTHOPEDIC SURGERY - DISCHARGE SUMMARY\nPatient: Rahul Jadhav | Age: 38/M | IPD No: IPD-88219\nAdmission: 22-Jan-2026 | Discharge: 24-Jan-2026\nConsultant: Dr. Vikram Patil, MS (Ortho)\n\nPROCEDURE PERFORMED:\nRight Knee Diagnostic Arthroscopy + Arthroscopic Partial Medial Meniscectomy (under Spinal Anesthesia).\n\nHOSPITAL COURSE:\nPatient tolerated surgery well. Post-op distal pulses intact. Passive knee bending initiated. Wound clean and dry.\nALLERGY NOTE: Known Penicillin Allergy (Avoid Amoxicillin, Augmentin, Ampicillin).\n\nDISCHARGE MEDICATIONS:\n1. Tab. Cefuroxime Axetil 500mg - 1 tab twice daily for 5 days (Safe Cephalosporin option)\n2. Tab. Aceclofenac 100mg + Paracetamol 325mg - 1 tab twice daily after food for 5 days\n3. Tab. Pantoprazole 40mg - 1 tab daily morning empty stomach for 7 days\n4. Tab. Chymoral Forte - 1 tab thrice daily 30 mins before food for 5 days (Anti-edema)\n\nPOST-OPERATIVE REHABILITATION:\n- Partial weight bearing with walker support for 7 days.\n- Quadriceps isometric exercises and ankle pumps 3 times daily.\n- Suture removal on post-op day 12 at Ortho OPD.\n",
      "created_at": "2026-01-24T12:00:00"
    },
    {
      "id": "rec_4",
      "patient_id": "pat_1",
      "title": "Right Knee MRI - Meniscal Tear",
      "category": "Lab Report",
      "date": "2026-01-18",
      "record_date": "2026-01-18",
      "facility": "Apex Advanced MRI Scanning Center",
      "doctor_or_facility": "Apex Advanced MRI Scanning Center",
      "summary": "Right knee MRI confirms Grade IIb oblique tear in the posterior horn of the medial meniscus with minimal effusion. Cruciate and collateral ligaments intact.",
      "ai_summary": "Right knee MRI confirms Grade IIb oblique tear in the posterior horn of the medial meniscus with minimal effusion. Cruciate and collateral ligaments intact.",
      "critical_alerts": [
        "Grade IIb tear in posterior horn of medial meniscus; sports and squatting activities restricted."
      ],
      "extracted_data": {
        "tests": [
          {
            "name": "Medial Meniscus",
            "value": "Grade IIb Tear (Posterior Horn)",
            "status": "HIGH",
            "range": "Intact"
          },
          {
            "name": "ACL",
            "value": "Intact",
            "status": "NORMAL",
            "range": "Intact"
          },
          {
            "name": "Lateral Meniscus",
            "value": "Normal",
            "status": "NORMAL",
            "range": "Normal"
          },
          {
            "name": "Joint Effusion",
            "value": "Minimal Suprapatellar",
            "status": "ELEVATED",
            "range": "None"
          }
        ],
        "vitals": {},
        "medicines": [],
        "allergies_noted": []
      },
      "file_name": "right_knee_mri_jan2026.pdf",
      "raw_text": "APEX ADVANCED MRI SCANNING CENTER\nMAGNETIC RESONANCE IMAGING (MRI) - RIGHT KNEE JOINT\nPatient: Rahul Jadhav | Age: 38/M | Ref By: Dr. Vikram Patil\nDate: 18-Jan-2026\n\nFINDINGS:\n- Medial Meniscus: Grade IIb oblique tear noted in the posterior horn of medial meniscus.\n- Lateral Meniscus: Normal morphology and signal intensity.\n- Anterior Cruciate Ligament (ACL): Intact, normal fibrillar architecture.\n- PCL & Collateral Ligaments: Intact.\n- Joint Space: Minimal suprapatellar joint effusion. No loose bodies.\n- Patellofemoral compartment: Normal cartilage thickness.\n\nIMPRESSION: Posterior horn medial meniscus tear (Right knee) with mild joint effusion. Orthopedic consultation advised.\n",
      "created_at": "2026-01-18T16:00:00"
    }
  ],
  "audit_logs": [
    {
      "id": "log_1",
      "user_name": "Dr. Ananya Sen",
      "user_role": "Doctor",
      "action": "Requested Access for Glycemic Evaluation",
      "details": "Consent ID: con_3 (24 hours)",
      "timestamp": "2026-09-22T07:15:00"
    },
    {
      "id": "log_2",
      "user_name": "Dr. Rajesh Sharma",
      "user_role": "Doctor",
      "action": "Requested Access",
      "details": "Consent ID: con_1 (7 days)",
      "timestamp": "2026-09-20T09:30:00"
    },
    {
      "id": "log_3",
      "user_name": "Rahul Jadhav",
      "user_role": "Patient",
      "action": "Approved by Patient",
      "details": "Consent ID: con_1 (7 days)",
      "timestamp": "2026-09-20T10:00:00"
    },
    {
      "id": "log_4",
      "user_name": "Dr. Rajesh Sharma",
      "user_role": "Doctor",
      "action": "Viewed Lab & Prescription Records",
      "details": "Consent ID: con_1 (7 days)",
      "timestamp": "2026-09-21T14:10:00"
    },
    {
      "id": "log_5",
      "user_name": "Dr. Rajesh Sharma",
      "user_role": "Doctor",
      "action": "Reviewed 2D Echocardiography Study",
      "details": "Consent ID: con_1 (7 days)",
      "timestamp": "2026-09-22T08:45:00"
    },
    {
      "id": "log_6",
      "user_name": "Dr. Meera Nambiar",
      "user_role": "Doctor",
      "action": "Requested Antenatal History",
      "details": "Consent ID: con_4 (Permanent)",
      "timestamp": "2026-09-10T08:30:00"
    },
    {
      "id": "log_7",
      "user_name": "Priya Sharma",
      "user_role": "Patient",
      "action": "Approved by Patient",
      "details": "Consent ID: con_4 (Permanent)",
      "timestamp": "2026-09-10T09:00:00"
    },
    {
      "id": "log_8",
      "user_name": "Dr. Meera Nambiar",
      "user_role": "Doctor",
      "action": "Logged Obstetric Notes",
      "details": "Consent ID: con_4 (Permanent)",
      "timestamp": "2026-09-12T11:50:00"
    },
    {
      "id": "log_9",
      "user_name": "Dr. Priya Deshmukh",
      "user_role": "Doctor",
      "action": "Requested Pulmonary & Inhaler History",
      "details": "Consent ID: con_5 (7 days)",
      "timestamp": "2026-08-18T09:40:00"
    },
    {
      "id": "log_10",
      "user_name": "Ramesh Kulkarni",
      "user_role": "Patient",
      "action": "Approved by Patient",
      "details": "Consent ID: con_5 (7 days)",
      "timestamp": "2026-08-18T10:00:00"
    },
    {
      "id": "log_11",
      "user_name": "Dr. Vikram Patil",
      "user_role": "Doctor",
      "action": "Requested Surgical Records Access",
      "details": "Consent ID: con_2 (Permanent)",
      "timestamp": "2026-01-20T13:30:00"
    },
    {
      "id": "log_12",
      "user_name": "Rahul Jadhav",
      "user_role": "Patient",
      "action": "Approved Permanent Access",
      "details": "Consent ID: con_2 (Permanent)",
      "timestamp": "2026-01-20T14:00:00"
    },
    {
      "id": "log_13",
      "user_name": "Dr. Vikram Patil",
      "user_role": "Doctor",
      "action": "Accessed Meniscectomy Post-Op Summary",
      "details": "Consent ID: con_2 (Permanent)",
      "timestamp": "2026-01-24T11:20:00"
    },
    {
      "id": "log_14",
      "user_name": "Dr. Priya Deshmukh",
      "user_role": "Doctor",
      "action": "Requested Pediatric Allergy History",
      "details": "Consent ID: con_6 (Permanent)",
      "timestamp": "2026-09-06T09:30:00"
    },
    {
      "id": "log_15",
      "user_name": "Ananya Iyer (Guardian)",
      "user_role": "Patient",
      "action": "Approved Permanent Access",
      "details": "Consent ID: con_6 (Permanent)",
      "timestamp": "2026-09-06T10:00:00"
    }
  ]
};
