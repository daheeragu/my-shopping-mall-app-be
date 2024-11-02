const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const cartController = require("../controllers/cart.controller");
// 로그인 한 유저만 상품 추가 가능 (토큰 확인)
router.post("/", authController.authenticate, cartController.addItemToCart);
// 카트에 담긴 상품리스트 불러오기
router.get("/", authController.authenticate, cartController.getCart);
// 삭제
router.delete(
  "/:id",
  authController.authenticate,
  cartController.deleteItemInCart
);
//수정하기
router.put("/:id", authController.authenticate, cartController.editCartItem);
// 카트 상품 수 가지고 오기
router.get("/qty", authController.authenticate, cartController.getCartQty);

module.exports = router;
