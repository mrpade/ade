Tables

##users 

id PK, role ENUM('patient','doctor','pharmacy','courier'), email UNIQUE, password_hash, first_name, last_name, birthdate, created_at 

Rassemble tous les acteurs : plus simple pour l’auth (Sequelize User.hasOne(Patient) etc.). 



##patients 

user_id PK/FK, blood_type, gender, phone, address 

Profil médical. 



##doctors 

user_id PK/FK, specialty, license_no, bio, fee_default 

fee_default = tarif télé-consult hors abonnement. 



##pharmacies 

user_id PK/FK, name, latitude, longitude, opening_hours 

Sera utilisé pour géolocalisation. 



##couriers 

user_id PK/FK, vehicle_type, plate_number 

Gestion livreurs. 



##diagnoses 

id PK, patient_id FK, icd_code, icd_title, symptoms_json, created_at, status ENUM('pending','validated','rejected') 

Stocke la requête symptômes et le verdict du médecin. 



##consultations 

id PK, patient_id FK, doctor_id FK, diagnosis_id FK NULL, scheduled_at, status ENUM('planned','done','cancelled'), mode ENUM('video','audio') 

RDV vidéo ou issu d’un check. 



##prescriptions 

id PK, consultation_id FK, pdf_url, created_at 

Lien vers ordonnance PDF signée. 



##products

id PK, name, form, dosage, atc_code 

Catalogue médicament (unique). 



##pharmacy_stock 

pharmacy_id FK, product_id FK, quantity, price, PK(pharmacy_id,product_id) 

Stock temps réel. 



##orders 

id PK, patient_id FK, pharmacy_id FK, status ENUM('pending','paid','preparing','shipped','delivered'), total_amount, created_at 

Commande e-pharmacie. 



##order_items 

order_id FK, product_id FK, qty, unit_price, PK(order_id,product_id) 

Détail de chaque commande. 



##deliveries 

id PK, order_id FK UNIQUE, courier_id FK, status ENUM('assigned','picked','delivered'), picked_at, delivered_at 

Suivi livraison. 



##checks 

id PK, diagnosis_id FK, doctor_id FK, answer TEXT, created_at 

Vérification humaine d’un diagnostic. 

 
 `NEW TABLES`

##questions

Stocke les **questions médicales conditionnelles** que le système pose à l’utilisateur en fonction des symptômes saisis.

Permet d’affiner un diagnostic initial automatisé en posant des questions ciblées (comme le ferait un médecin).

### 📌 Champs clés :

CREATE TABLE questions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  question_text TEXT NOT NULL,
  question_type ENUM('yes_no', 'multiple_choice', 'number', 'scale') DEFAULT 'yes_no',
  trigger_symptom_id INT UNSIGNED,
  FOREIGN KEY (trigger_symptom_id) REFERENCES symptoms(id) ON DELETE SET NULL
);

---

##question_options

Contient les **réponses possibles** à une question (ex. : Oui / Non ; "2 à 5 jours", etc.).

Permet à l’utilisateur de répondre via une interface simple, tout en normalisant les données collectées.


CREATE TABLE question_options (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  question_id INT UNSIGNED NOT NULL,
  option_label VARCHAR(100) NOT NULL,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

---

##option_impacts

Définit l’**impact de chaque réponse** sur le score de probabilité des maladies.

Permet de recalculer la pertinence des maladies proposées en fonction des réponses données.


CREATE TABLE option_impacts (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  option_id INT UNSIGNED NOT NULL,
  disease_id INT UNSIGNED NOT NULL,
  score_delta DECIMAL(4,2) NOT NULL,
  FOREIGN KEY (option_id) REFERENCES question_options(id) ON DELETE CASCADE,
  FOREIGN KEY (disease_id) REFERENCES Diseases_list(id) ON DELETE CASCADE
);

---

##user_question_responses

Enregistre les **réponses d’un utilisateur** lors de sa session de diagnostic.

Permet de personnaliser le diagnostic, de garder une trace médicale, ou d'entraîner un moteur IA plus tard.


CREATE TABLE user_question_responses (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  question_id INT UNSIGNED NOT NULL,
  selected_option_id INT UNSIGNED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (question_id) REFERENCES questions(id),
  FOREIGN KEY (selected_option_id) REFERENCES question_options(id)
);
