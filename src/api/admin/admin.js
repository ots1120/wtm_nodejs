import { Router } from 'express';

// controllers
import * as adminController from '../../controllers/admin/adminController';

//util
// import { authenticateUser } from '../../utils/auth';
// import { menuImgUpload } from '../../utils/upload';
// import { reviewImgUpload } from '../../utils/upload';

const router = Router();

//대시보드 조회
router.get('/store/:storeId', adminController.getDashboard);

// 모든 가게 리뷰 조회
router.get('/store/:storeId/reviews', adminController.getReviews);
router.post(
  '/store/:storeId/reviews/:reviewId/reply',
  adminController.createComment
);
router.put(
  '/store/:storeId/reviews/:reviewId/reply/:commentId',
  adminController.updateReply
);
router.delete(
  '/store/:storeId/reviews/:reviewId/reply/:commentId',
  adminController.deleteComment
);

// 공지 조회
router.get('/store/:storeId/notices', adminController.getNotices);
router.post('/store/:storeId/notices', adminController.createNotices);
router.put('/store/:storeId/notices/:noticeId', adminController.updateNotices);
router.delete(
  '/store/:storeId/notices/:noticeId',
  adminController.deleteNotices
);
export default router;
