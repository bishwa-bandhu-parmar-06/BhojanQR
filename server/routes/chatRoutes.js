const express = require("express");
const router = express.Router();
const { handleCustomerChat, handleLandingChat } = require("../controllers/chatController");

router.post("/ask", handleCustomerChat);

router.post("/support", handleLandingChat);

module.exports = router;
