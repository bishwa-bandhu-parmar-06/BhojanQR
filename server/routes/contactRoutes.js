const express = require("express");
const { submitContactForm } = require("../controllers/contactController");

const router = express.Router();

// Contact form routes
router.post("/submit", submitContactForm);

module.exports = router;
