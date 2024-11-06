const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const wishlistController = require("../controllers/wishlist.controller");

router.get("/", authController.authenticate, wishlistController.getWishlist);
router.post("/", authController.authenticate, wishlistController.addWishlist);
router.delete(
  "/:id",
  authController.authenticate,
  wishlistController.deleteWishlist
);

module.exports = router;
