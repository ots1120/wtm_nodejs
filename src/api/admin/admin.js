import { Router } from 'express';

// controllers
import * as reviewController from '../../controllers/admin/adminController.js';

//util
// import { authenticateUser } from '../../utils/auth';
// import { menuImgUpload } from '../../utils/upload';
// import { reviewImgUpload } from '../../utils/upload';

const router = Router();

// 모든 가게 리뷰 조회
router.get('/store/:storeId/reviews', reviewController.getReviews);
router.post('/store/:storeId/reviews/:reviewId/reply', reviewController.createReply);
router.put('/store/:storeId/reviews/:reviewId/reply/:replyId', reviewController.updateReply);
router.delete('/store/:storeId/reviews/:reviewId/reply:replyId', reviewController.deleteReply);

export default router;