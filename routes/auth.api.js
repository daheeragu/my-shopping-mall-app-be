const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

// 로그인
router.post("/login", authController.loginWithEmail);
router.post("/google", authController.loginWithGoogle);

module.exports = router;
