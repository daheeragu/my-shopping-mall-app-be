const User = require("../models/User");
const bcrpyt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const { OAuth2Client } = require("google-auth-library");
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const authController = {};

//로그인
authController.loginWithEmail = async (req, res) => {
  try {
    //1. 유저에게 이메일과 PW를 받아온다
    const { email, password } = req.body;
    //2. 유저 이메일이 데이터베이스에 존재하는 이메일인지 확인한다
    let user = await User.findOne({ email });
    if (user) {
      // 3. 유저의 패스워드가 일치하는지 확인
      const isMatch = await bcrpyt.compare(password, user.password);
      if (isMatch) {
        // 4. 일치한다면 토큰을 생성
        const token = user.generateToken();
        // 5. 응답에 유저와 토큰값을 보낸다
        return res.status(200).json({ status: "success", user, token });
      } else {
        throw new Error("비밀번호가 일치하지 않습니다.");
      }
    }
    throw new Error("입력하신 유저가 존재하지 않습니다");
  } catch (error) {
    // 6. 일치하지 않다면 에러를 보낸다
    res.status(400).json({ status: "FAIL", message: error.message });
  }
};

authController.loginWithGoogle = async (req, res) => {
  try {
    // 4. 백엔드에서 로그인하기
    // 토큰값을 읽어와서 => 유저정보를 뽑아내고 email
    //   a. 이미 로그인을 한 적이 있는 유저 => 로그인 시키고 토큰값 주면 됨
    //   b. 처음 로그인 시도를 한 유저 => 유저 정보를 먼저 생성 => 토큰 값을 넘김
    const { token } = req.body;
    const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const { email, name } = ticket.getPayload();
    console.log("eee", email, name);

    let user = await User.findOne({ email });

    if (!user) {
      // 유저를 새로 생성
      const randomPassword = "" + Math.floor(Math.random() * 100000000);
      const salt = await bcrpyt.genSalt(10);
      const newPassword = await bcrpyt.hash(randomPassword, salt);
      user = new User({
        name,
        email,
        password: newPassword,
      });

      await user.save();
    }
    // 토큰 발행 리턴
    const sessionToken = await user.generateToken();
    return res
      .status(200)
      .json({ status: "success", user, token: sessionToken });
  } catch (error) {
    res.status(400).json({ status: "FAIL", message: error.message });
  }
};

// 토큰의 유효성 확인
authController.authenticate = async (req, res, next) => {
  try {
    const tokenString = req.headers.authorization;
    if (!tokenString) throw new Error("Token not found");
    const token = tokenString.replace("Bearer ", "");
    jwt.verify(token, JWT_SECRET_KEY, (error, payload) => {
      if (error) throw new Error("invalid token");
      req.userId = payload._id;
    });
    next();
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

// 관리자 체크
authController.checkAdminPermission = async (req, res, next) => {
  try {
    // token 값을 이용해서 특정 유저를 알아냄
    const { userId } = req;
    const user = await User.findById(userId);
    if (user.level !== "admin") throw new Error("관리자 권한이 아닙니다.");
    next();
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};
module.exports = authController;
