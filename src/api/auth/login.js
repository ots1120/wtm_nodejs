import { Router } from 'express';
import * as authController from '../../controllers/auth/authController'

const router = Router();

// 로그인 API
router.post('/', authController.login);

export default router;
