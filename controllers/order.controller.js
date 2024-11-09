const orderController = {};
const Order = require("../models/Order");
const productController = require("./product.controller");
const { randomStringGenerator } = require("../utils/randomStringGenerator");
const { populate } = require("dotenv");
const PAGE_SIZE = 8;
orderController.createOrder = async (req, res) => {
  try {
    // FE 데이터 받아오기
    const { userId } = req;
    const { shipTo, contact, totalPrice, orderList } = req.body;
    // 재고 확인 & 재고 업데이트
    const insufficientStockItems = await productController.checkItemListStock(
      orderList
    );
    // 재고가 충분하지 않은 아이템이 있었으면 => 에러
    if (insufficientStockItems.length > 0) {
      const errorMessage = insufficientStockItems.reduce(
        (total, item) => (total += item.message),
        ""
      );
      throw new Error(errorMessage);
    }
    // 오더를 만들자
    const newOrder = new Order({
      userId,
      totalPrice,
      shipTo,
      contact,
      items: orderList,
      orderNum: randomStringGenerator(),
    });

    await newOrder.save();
    res.status(200).json({ status: "success", orderNum: newOrder.orderNum });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

// 내 주문상품목록 받아오기
orderController.getOrder = async (req, res) => {
  try {
    const { userId } = req;
    const order = await Order.find({ userId }).populate({
      path: "items",
      populate: {
        path: "productId",
        model: "Product",
      },
    });
    if (!order) throw new Error("주문하신 상품이 없습니다.");
    res.status(200).json({ status: "success", order: order });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

//관리자 전체 주문 상품 목록 받아오기
orderController.getOrderList = async (req, res) => {
  try {
    const { page, ordernum } = req.query;
    const cond = ordernum
      ? { orderNum: { $regex: ordernum, $options: "i" } }
      : {};

    let query = Order.find(cond)
      .populate({
        path: "userId", // User 컬렉션의 userId 정보 가져오기
      })
      .populate({
        path: "items.productId", // items의 각 productId를 통해 Product 정보 가져오기
        model: "Product",
      });
    let response = { status: "success" };

    if (page) {
      query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);
      const totalItemNum = await Order.find(cond).countDocuments();
      const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
      response.totalPageNum = totalPageNum;
    }

    const orderList = await query.exec();
    response.data = orderList;

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

orderController.updateOrder = async (req, res) => {
  try {
    // 상태 갱신
    const { id } = req.params;
    const { status } = req.body;

    const updateOrder = await Order.findByIdAndUpdate(
      id,
      { status: status },
      { new: true }
    );
    if (!updateOrder) throw new Error("상태 업데이트에 실패했습니다.");
    res.status(200).json({ status: "success", data: updateOrder });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};
module.exports = orderController;
