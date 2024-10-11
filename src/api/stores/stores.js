import { Router } from 'express';

// controllers
import * as storesController from '../../controllers/stores/storesController';

// util
import { authenticateUser } from '../../utils/auth';
import { menuImgUpload } from '../../utils/upload';
import { reviewImgUpload } from '../../utils/upload';

const router = Router();

// 모든 가게 정보 조회
router.get('/', storesController.getAllStores);

// 특정 가게 정보 조회
router.get('/:storeId', storesController.getStoreById);

// 가게 메뉴 조회
router.get('/:storeId/menus', storesController.getMenusByStoreId);

// 가게 메뉴 등록
router.post(
  '/:storeId/menus',
  menuImgUpload.array('menuImages', 5),
  authenticateUser,
  storesController.addMenu
);

// 공지사항 조회
router.get('/:storeId/notices', storesController.getNoticesByStoreId);

// 가게 티켓 정보 조회
router.get(
  '/:storeId/tickets',
  authenticateUser,
  storesController.getTicketsByStoreId
);

// 가게 리뷰 리스트 조회
router.get('/:storeId/reviews', storesController.getReviewsByStoreId);

// 리뷰 정보 조회
router.post(
  '/:storeId/reviews',
  reviewImgUpload.array('reviewImages', 5),
  authenticateUser,
  storesController.addReview
);

export default router;
