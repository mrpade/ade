// src/routes/auth.js
require("dotenv").config();
const rateLimit = require("express-rate-limit");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const router = express.Router();
const { User, Patient, Doctor, Pharmacy, Courier } = require("../models");
const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Limitation par IP : max 5 requêtes / 15 minutes
const forgotByIpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    error:
      "Trop de demandes de réinitialisation depuis cette IP, réessayez plus tard.",
  },
});

// Limitation par email : max 3 requêtes / 24h
const forgotByEmailLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 heures
  max: 3,
  keyGenerator: (req, res) => req.body.email, // utilise l'email comme clé
  message: {
    error:
      "Vous avez atteint le nombre maximal de demandes pour cet email. Réessayez demain.",
  },
});

// Appliquer les deux sur la route POST /forgot :
router.post(
  "/forgot",
  forgotByIpLimiter,
  forgotByEmailLimiter,
  async (req, res) => {
    // logique existante
  }
);

// Configure transporter using Ethereal for testing
let transporter;
(async () => {
  // Create a test SMTP service account from ethereal.email
  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
})();

// Enregistrement
router.post("/register", async (req, res) => {
  try {
    const { email, password, role, first_name, last_name, birthdate } =
      req.body;
    if (!email || !password || !role)
      return res
        .status(400)
        .json({ error: "Email, mot de passe et rôle requis" });
    console.log(
      "User model ready:",
      User && typeof User.findOne === "function"
    );
    if (await User.findOne({ where: { email } }))
      return res.status(409).json({ error: "Email déjà utilisé" });

    const password_hash = await bcrypt.hash(password, 12);
    const user = await User.create({
      email,
      password_hash,
      role,
      first_name,
      last_name,
      birthdate,
    });

    // Profil spécifique selon rôle
    if (role === "doctor") {
      const { speciality, onmc, workplace, bio } = req.body;
      if (!speciality || !onmc)
        return res.status(400).json({ error: "Spécialité et ONMC requis" });
      await Doctor.create({
        user_id: user.id,
        speciality,
        onmc,
        workplace,
        bio,
      });
    } else if (role === "pharmacy") {
      const { name, address, latitude, longitude } = req.body;
      if (!name || !address)
        return res.status(400).json({ error: "Nom et adresse requis" });
      await Pharmacy.create({
        user_id: user.id,
        name,
        address,
        latitude,
        longitude,
      });
    } else if (role === "courier") {
      const { vehicle_type, plate_number, driver_license } = req.body;
      await Courier.create({
        user_id: user.id,
        vehicle_type,
        plate_number,
        driver_license,
      });
    } else {
      await Patient.create({ user_id: user.id });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '12h' });
    res.status(201).json({ token, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Connexion
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ token, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Mot de passe oublié
router.post("/forgot", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "Email inconnu" });
    }
    // Génération du token et expiration (1h)
    const token = crypto.randomBytes(20).toString("hex");
    const expires = new Date(Date.now() + 3600 * 1000);
    await user.update({ reset_token: token, reset_expires: expires });
    const resetLink = `${FRONTEND_URL}/reset/${token}`;
    // Envoi de l'email
    const info = await transporter.sendMail({
      to: user.email,
      subject: "Réinitialisation de votre mot de passe",
      html: `<p>Cliquez sur le lien suivant pour réinitialiser votre mot de passe (valable 1h):</p><p><a href="${resetLink}">${resetLink}</a></p>`,
    });
    console.log(
      "Password reset email sent. Preview URL: %s",
      nodemailer.getTestMessageUrl(info)
    );
    res.json({
      message: "Email de réinitialisation envoyé",
      previewUrl: nodemailer.getTestMessageUrl(info),
    });
  } catch (err) {
    console.error("[AUTH][FORGOT]", err);
    res
      .status(500)
      .json({ error: err.message || "Erreur serveur lors de la demande" });
  }
});

// Réinitialisation du mot de passe
router.post("/reset", async (req, res) => {
  const { token, password, confirmPassword } = req.body;
  if (!password || !confirmPassword) {
    return res
      .status(400)
      .json({ error: "Mot de passe et confirmation requis" });
  }
  if (password !== confirmPassword) {
    return res
      .status(400)
      .json({ error: "Les mots de passe ne correspondent pas" });
  }
  try {
    const user = await User.findOne({
      where: {
        reset_token: token,
        reset_expires: { [require("sequelize").Op.gt]: new Date() },
      },
    });
    if (!user) {
      return res.status(400).json({ error: "Token invalide ou expiré" });
    }
    const hash = await bcrypt.hash(password, 12);
    await user.update({
      password_hash: hash,
      reset_token: null,
      reset_expires: null,
    });
    res.json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (err) {
    console.error("[AUTH][RESET]", err);
    res
      .status(500)
      .json({
        error: err.message || "Erreur serveur lors de la réinitialisation",
      });
  }
});

module.exports = router;
