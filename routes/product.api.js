const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const productController = require("../controllers/product.controller");

//관리자인지 확인이 필요 (미들웨어로)
router.post(
  "/",
  authController.authenticate,
  authController.checkAdminPermission,
  productController.createProduct
);

module.exports = router;
