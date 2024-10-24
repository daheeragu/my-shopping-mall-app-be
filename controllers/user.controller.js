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
      throw new Error("User already exists");
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

//로그인
userController.loginWithEmail = async (req, res) => {
  try {
    //1. 유저에게 이메일과 PW를 받아온다
    const { email, password } = req.body;
    //2. 유저 이메일이 데이터베이스에 존재하는 이메일인지 확인한다
    const user = await User.findOne({ email });
    if (user) {
      // 3. 유저의 패스워드가 일치하는지 확인
      const isMatch = bcrpyt.compareSync(password, user.password);
      if (isMatch) {
        // 4. 일치한다면 토큰을 생성
        const token = user.generateToken();
        // 5. 응답에 유저와 토큰값을 보낸다
        return res.status(200).json({ status: "success", user, token });
      } else {
        throw new Error("비밀번호가 일치하지 않습니다.");
      }
    }
    throw new Error("입력하신 유저가 존재하지 않습니다.");
  } catch (error) {
    // 6. 일치하지 않다면 에러를 보낸다
    res.status(400).json({ status: "FAIL", message: error.message });
  }
};

module.exports = userController;
