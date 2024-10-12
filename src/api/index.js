/*
 * 메인 라우터 파일 : 모든 라우터 통합하고, app.js에서 사용함
 */
import { Router } from 'express';
import storesRouter from './stores/stores.js'; // /stores 라우터 가져오기
import loginRouter from './auth/login.js';
import userRouter from './auth/user.js';
import adminRouter from './admin/admin.js';

const router = Router();

// API 경로 연결
router.use('/login', loginRouter); // 로그인 관련 API를 정의한 라우터 모듈
router.use('/user', userRouter); // 사용자 관련 API를 정의한 라우터 모듈
router.use('/admin', adminRouter); // 관리자 관련 API를 정의한 라우터 모듈
router.use('/stores', storesRouter); // 식당 정보 관련 API를 정의한 라우터 모듈

export default router;
