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

router.get("/", productController.getProducts);

// 상품 디테일 가지고 오기
router.get("/:id", productController.getProductDetail);
router.put(
  "/:id",
  authController.authenticate,
  authController.checkAdminPermission,
  productController.updateProduct
);

router.delete(
  "/:id",
  authController.authenticate,
  authController.checkAdminPermission,
  productController.deleteProduct
);

module.exports = router;
