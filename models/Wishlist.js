const mongoose = require("mongoose");
const User = require("./User");
const Product = require("./Product");
const Schema = mongoose.Schema;

const wishlistSchema = Schema(
  {
    userId: { type: mongoose.ObjectId, ref: User, required: true },
    items: [
      {
        productId: { type: mongoose.ObjectId, ref: Product },
        price: { type: Number, required: true },
        image: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

wishlistSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.__v;
  delete obj.updateAt;
  delete obj.createAt;
  return obj;
};

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

module.exports = Wishlist;
