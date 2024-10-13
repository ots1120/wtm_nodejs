import bcrypt from 'bcrypt';
import { Router } from 'express';
import { newToken } from '../../utils/auth'; // newToken 함수 사용
import UserModel from '../../models/user/UserModel';

const router = Router();

// 로그인 API
router.post('/', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. 사용자 찾기
    const user = await UserModel.findOne({ username }).exec();
    if (!user) {
      return res.status(401).json({ message: '사용자가 존재하지 않습니다.' });
    }

    // 2. 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
    }

    // 3. JWT 토큰 생성
    const token = newToken(user);

    // 4. 로그인 성공 시 사용자 정보와 토큰 반환
    return res.status(200).json({
      message: '로그인 성공',
      user: {
        username: user.username,
        nickname: user.nickname,
      },
      token,
    });
  } catch (error) {
    // 5. 서버 에러 처리
    console.error('로그인 중 오류 발생:', error);
    return res.status(500).json({
      message: '서버 에러가 발생했습니다. 잠시 후 다시 시도해 주세요.',
    });
  }
});

export default router;
