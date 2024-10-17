import { Router } from "express";
import * as myController from "../../controllers/my/myController.js";
import { upload } from "../../utils/upload.js"; // upload 설정 가져오기

const router = Router();

// 토큰대신 파라미터 진행 -> securitySchema 및 req.header변경 추후 요망

// 사용자 전용 메인 페이지
router.get("/:_id", myController.getMypage);

// 사용자 정보 불러오기
router.get("/settings/:_id", myController.getMySettings);

// 사용자 정보 업데이트
router.put("/settings/:_id", myController.updateMySettings);

// 사용자가 소유한 티켓의 가게 목록 조회
router.get("/tickets/:userId", myController.getTicketsOwnedByUser);

// 나중엔 store_id만 남겨보자 ~
// 티켓 사용
router.post("/tickets/:storeId", myController.useMyTicket);

// 티켓 충전
router.post("/tickets/stores/charge", myController.purchaseMyTicket);

// 사용자의 모든 티켓 구매 사용 내역 조회
router.get("/tickets/history/:userId", myController.getMyTicketHistory);

// 사용자의 특정 가게 티켓 구매 사용 내역 조회
router.get(
  "/tickets/:userId/:storeId/history",
  myController.getMyTicketHistoryByStore
);

// 본인 리뷰 목록 조회
router.get("/reviews/:userId", myController.getMyReviews);

// 사용자 개인 북마크 조회
router.get("/bookmarks/:userId", myController.getMyBookmarks);

// 사용자가 본인 리뷰 삭제
router.delete("/reviews/:reviewId", myController.deleteMyReview);

export default router;
