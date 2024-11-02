const Cart = require("../models/Cart");
const cartController = {};
cartController.addItemToCart = async (req, res) => {
  try {
    const { userId } = req;
    const { productId, size, qty } = req.body;
    // 유저를 가지고 카트 찾기
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      // 유저가 만든 카트가 없다면 만들어 주기
      cart = new Cart({ userId });
      await cart.save();
    }
    // 이미 카트에 들어가 있는 아이템이냐?
    const existItem = cart.items.find(
      (item) => item.productId.equals(productId) && item.size === size
    );
    if (existItem) {
      //그렇다면, 에러('이미 아이템이 카트에 있습니다.')
      throw new Error("아이템이 이미 카트에 담겨 있습니다.");
    }
    // 그렇지 않으면,  카트에 상품을 추가
    cart.items = [...cart.items, { productId, size, qty }];
    await cart.save();
    res
      .status(200)
      .json({ status: "success ", data: cart, cartItemQty: cart.items.length });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

cartController.getCart = async (req, res) => {
  try {
    const { userId } = req;
    const cart = await Cart.findOne({ userId }).populate({
      path: "items",
      populate: {
        path: "productId",
        model: "Product",
      },
    });
    res.status(200).json({ status: "success", data: cart.items });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

//삭제하기
cartController.deleteItemInCart = async (req, res) => {
  try {
    const { userId } = req;
    const { id } = req.params;
    const cart = await Cart.findOne({ userId });
    cart.items = cart.items.filter((item) => !item._id.equals(id));
    await cart.save();
    res.status(200).json({ status: "success", cartItemQty: cart.items.length });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};
// 수정하기
cartController.editCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    const { qty } = req.body;

    const cart = await Cart.findOne({ userId }).populate({
      path: "items",
      populate: {
        path: "productId",
        model: "Product",
      },
    });

    if (!cart) throw new Error("카트 정보가 없습니다.");
    const index = cart.items.findIndex((item) => item._id.equals(id));

    if (index < 0) throw new Error("해당 상품을 찾을 수가 없습니다.");

    cart.items[index].qty = qty;
    await cart.save();

    res.status(200).json({ status: "success", data: cart.items });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};
module.exports = cartController;
