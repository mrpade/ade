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

 
 