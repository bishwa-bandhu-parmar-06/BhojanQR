const express = require("express");
const router = express.Router();
const { submitContactForm } = require("../controllers/contactController");
const { validateContactForm } = require("../validators/contactValidator");

router.post("/submit", validateContactForm, submitContactForm);

module.exports = router;
