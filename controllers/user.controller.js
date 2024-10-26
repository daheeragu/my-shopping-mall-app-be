const User = require("../models/User");
const bcrpyt = require("bcryptjs");
const userController = {};

//회원가입
userController.createUser = async (req, res) => {
  try {
    let { email, password, name, level } = req.body;
    // 이메일 중복 검사
    const user = await User.findOne({ email });
    if (user) {
      throw new Error("이미 존재하는 유저입니다.");
    }
    //PW 암호화
    const salt = await bcrpyt.genSaltSync(10);
    password = await bcrpyt.hash(password, salt);
    const newUser = new User({
      email,
      password,
      name,
      level: level ? level : "customer",
    });
    await newUser.save();
    return res.status(200).json({ status: "SUCCESS" });
  } catch (error) {
    res.status(400).json({ status: "FAIL", message: error.message });
  }
};

// 토큰으로 유저 정보 가지고 오기
userController.getUser = async (req, res) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("Invalid token");
    }
    res.status(200).json({ status: "success", user });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

module.exports = userController;
