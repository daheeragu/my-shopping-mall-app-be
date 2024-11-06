const Product = require("../models/Product");
const productController = {};
const PAGE_SIZE = 4;
productController.createProduct = async (req, res) => {
  try {
    const {
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      status,
    } = req.body;

    const product = new Product({
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      status,
    });

    await product.save();
    res.status(200).json({ status: "success", product });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

productController.getProducts = async (req, res) => {
  try {
    const { page, name } = req.query;
    const cond = name
      ? { name: { $regex: name, $options: "i" }, isDeleted: false }
      : { isDeleted: false };
    let query = Product.find(cond);
    let response = { status: "success" };

    if (page) {
      query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);

      // 최종 몇 개의 페이지가 필요로 한지
      // 데이터가 총 몇개인지 확인
      const totalItemNum = await Product.find(cond).countDocuments();
      // 그 데이터 총 개수 / PAGE_SIZE
      const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
      response.totalPageNum = totalPageNum;
    }

    //쿼리를 실행
    const productList = await query.exec();
    response.data = productList;

    // if (name) {
    //   const products = await Product.find({
    //     name: { $regex: name, $option: "i" },
    //   });
    // } else {
    //   const products = await Product.find({});
    // }

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

productController.updateProduct = async (req, res) => {
  try {
    // 수정하려고 하는 상품의 아이디를 가지고 옴
    const productId = req.params.id;
    const {
      sku,
      name,
      size,
      image,
      price,
      description,
      category,
      stock,
      status,
    } = req.body;

    const product = await Product.findByIdAndUpdate(
      { _id: productId },
      { sku, name, size, image, price, description, category, stock, status },
      { new: true }
    );

    if (!product) throw new Error("수정할 상품이 존재하지 않습니다.");
    res.status(200).json({ status: "sucess", data: product });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

// isDelete의 존재를 잊지 않기
productController.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findByIdAndUpdate(
      { _id: productId },
      { isDeleted: true },
      { new: true } // 업데이트된 문서를 반환
    );
    if (!product) throw new Error("삭제할 상품이 존재하지 않습니다.");
    res.status(200).json({ status: "success" });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

// 상품 디테일 가지고 오기
productController.getProductDetail = async (req, res) => {
  try {
    const productId = req.params.id;
    const productDetail = await Product.findById(productId);
    if (!productDetail) throw new Error("선택한 상품이 존재하지 않습니다.");
    res.status(200).json({ status: "success", data: productDetail });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

productController.checkStock = async (item) => {
  //내가 사려는 아이템 재고 정보 들고오기
  const product = await Product.findById(item.productId);
  //내가 사려는 아이템 수량과 재고 수량을 비교
  if (product.stock[item.size] < item.qty) {
    //재고가 불충분하면 불충분 메시지와 함께 데이터 반환
    return {
      isVerify: false,
      message: `${product.name}의 ${item.size} 재고가 부족합니다.`,
    };
  }
  //충분하다면 재고에서 qty를 빼고 후에 성공한 결과를 반환
  const newStock = { ...product.stock };
  newStock[item.size] -= item.qty;
  product.stock = newStock;

  await product.save();
  return { isVerify: true };
};
// 재고 확인
productController.checkItemListStock = async (itemList) => {
  const insufficientStockItems = [];
  //재고 확인 로직
  await Promise.all(
    itemList.map(async (item) => {
      const stockCheck = await productController.checkStock(item);
      if (!stockCheck.isVerify) {
        insufficientStockItems.push({ item, message: stockCheck.message });
      }
      return stockCheck;
    })
  );
  return insufficientStockItems;
};
module.exports = productController;
