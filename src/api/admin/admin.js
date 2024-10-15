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
  '/store/:storeId/reviews/:reviewId/comments',
  adminController.createComment
);
router.put(
  '/store/:storeId/reviews/:reviewId/comments/:commentId',
  adminController.updateComment
);
router.delete(
  '/store/:storeId/reviews/:reviewId/comments/:commentId',
  adminController.deleteComment
);

// 공지 관리
router.get('/store/:storeId/notices', adminController.getNotices);
router.post('/store/:storeId/notices', adminController.createNotices);

//공지 수정
router.get('/store/:storeId/notices/:noticeId', adminController.getNoticeById);
router.put('/store/:storeId/notices/:noticeId', adminController.updateNotices);
router.delete(
  '/store/:storeId/notices/:noticeId',
  adminController.deleteNotices
);

// 메뉴 관리
router.get('/store/:storeId/menus', adminController.getMenus);
// router.post("/store/:storeId/menus", adminController.createMenus);
// router.put("/store/:storeId/menus", adminController.updateMenus);
// router.delete("/store/:storeId/menus", adminController.deleteMenus);

// 식권 조회
router.get('/store/:storeId/tickets', adminController.getTickets);

// 식당 정보 수정
router.get('/store/:storeId/myStoreInfo', adminController.getMyStoreInfo);
router.put('/store/:storeId/myStoreInfo', adminController.updateMyStoreInfo);

export default router;
