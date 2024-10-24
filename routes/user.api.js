const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

// 1. 회원가입
router.post("/", userController.createUser);
// 2. 로그인
router.post("/login");

module.exports = router;
