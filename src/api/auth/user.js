// libs
import bcrypt from 'bcrypt';
import { Router } from 'express';

// modules
// import passport from '../passport.js';
import UserModel from '../../models/user/UserModel.js';

const router = Router();

// 회원가입 API
router.post('/signup', async (req, res) => {
  try {
    console.log('Received data:', req.body);
    const { username, password, nickname } = req.body;

    // 1. 사용자 중복 확인
    const existingUser = await UserModel.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: '이미 존재하는 사용자입니다.' });
    }

    // 2. 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. 새로운 사용자 생성 및 저장
    const newUser = new UserModel({
      username,
      password: hashedPassword,
      nickname,
    });

    const savedUser = await newUser.save();

    // 4. 회원가입 성공 응답
    return res.status(201).json({
      message: '회원가입이 완료되었습니다.',
      user: { username: savedUser.username, nickname: savedUser.nickname },
    });
  } catch (error) {
    // 5. 에러 처리
    console.log('회원가입 중 에러 발생:', error);
    return res.status(500).json({
      message: '서버 에러가 발생했습니다. 잠시 후 다시 시도해 주세요.',
      error: error.message,
    });
  }
});

export default router;
