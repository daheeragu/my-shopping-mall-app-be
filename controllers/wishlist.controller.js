const Wishlist = require("../models/Wishlist");

const wishlistController = {};

wishlistController.addWishlist = async (req, res) => {
  try {
    const { userId } = req;
    const { item } = req.body;

    // 유저를 가지고 위시리스트 찾기
    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      // 없다면 만들어 주기
      wishlist = new Wishlist({ userId });
      await wishlist.save();
    }

    // 이미 위시리스트에 들어가 있는 아이템이냐?
    const existItem = wishlist.items?.find((wishItem) =>
      wishItem.productId.equals(item._id)
    );

    if (existItem) {
      throw new Error("상품이 이미 위시리스트에 담겨 있습니다.");
    }
    // 그렇지 않으면 위시리스트에 상품을 추가
    wishlist.items = [
      ...wishlist.items,
      { productId: item._id, image: item.image, price: item.price },
    ];

    await wishlist.save(); // 변경 사항 저장
    res.status(200).json({ status: "success", data: wishlist });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

wishlistController.deleteWishlist = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    const wishlist = await Wishlist.findOne({ userId });
    wishlist.items = wishlist.items.filter(
      (wishItem) => !wishItem.productId.equals(id)
    );
    await wishlist.save();
    res.status(200).json({ status: "success" });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

wishlistController.getWishlist = async (req, res) => {
  try {
    const { userId } = req;
    const wishlist = await Wishlist.findOne({ userId }).populate({
      path: "items",
      populate: {
        path: "productId",
        model: "Product",
      },
    });
    res.status(200).json({ status: "success", data: wishlist.items });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};
module.exports = wishlistController;
