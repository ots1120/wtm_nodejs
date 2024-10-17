// libs
import { Router } from 'express';
import * as userController from '../../controllers/user/userController'

// modules
// import passport from '../passport.js';

const router = Router();

// 회원가입 API
router.post('/signup', userController.createUser)

export default router;
