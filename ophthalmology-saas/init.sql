-- Init DB Ophthalmology SaaS

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'doctor',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE patients (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  birth_date DATE,
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  doctor_id INTEGER REFERENCES users(id),
  date_time TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled',
  notes TEXT
);

CREATE TABLE exams (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  appointment_id INTEGER REFERENCES appointments(id),
  visual_acuity_left DECIMAL,
  visual_acuity_right DECIMAL,
  intraocular_pressure_left DECIMAL,
  intraocular_pressure_right DECIMAL,
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prescriptions (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  exam_id INTEGER REFERENCES exams(id),
  medication VARCHAR(255),
  dosage VARCHAR(100),
  duration VARCHAR(50),
  instructions TEXT
);

CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  appointment_id INTEGER REFERENCES appointments(id),
  amount DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for performance
CREATE INDEX idx_appointments_date ON appointments(date_time);
CREATE INDEX idx_exams_patient ON exams(patient_id);

