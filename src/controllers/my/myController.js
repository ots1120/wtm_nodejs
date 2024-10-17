import UserModel from '../../models/user/UserModel';
import TicketModel from '../../models/ticket/TicketModel';
import StoreModel from '../../models/store/StoreModel';
import ReviewModel from '../../models/review/ReviewModel';
import TicketHistoryPurchaseModel from '../../models/ticket/TicketHistoryPurchaseModel';
import TicketHistoryUsageModel from '../../models/ticket/TicketHistoryUsageModel';
import BookmarkModel from '../../models/bookmark/BookmarkModel';
import ReviewScoreModel from '../../models/review/ReviewScoreModel';
import mongoose from 'mongoose';

// 사용자 전용 메인 페이지
const getMypage = async (req, res) => {
  try {
    // swagger test용
    const { _id } = req.params;
    const user = await UserModel.findOne({ _id });

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: '설정 업데이트 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
};

// 사용자 정보 불러오기
const getMySettings = async (req, res) => {
  try {
    // swagger test용
    const { _id } = req.params;
    const user = await UserModel.findOne({ _id });

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: '설정 업데이트 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
};
// 사용자 정보 업데이트
const updateMySettings = async (req, res) => {
  try {
    // swagger test용
    const { _id } = req.params;

    const { email, name, password, phone } = req.body;
    console.log(_id);
    console.log(email);
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id },
      { name, password, phone, email },
      { new: true } // upsert: true, runValidators: true
    );

    res.json({
      message: '사용자 정보가 성공적으로 업데이트되었습니다.',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error during updating user settings:', error);
    res.status(500).json({
      message: '정보 업데이트 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
};

// 티켓 소유 가게 목록 조회
// amount 로우별로 계산이 들어가는 것을 총 amount를 집계하여 계산될수있도록 수정
const getTicketsOwnedByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Step 1: 구입 스키마에서 해당 사용자의 ticketId와 storeId를 조회
    const purchasedTickets = await TicketHistoryPurchaseModel.find({
      userId,
    })
      .populate('ticketId')
      .exec();

    // Step 2: 사용 스키마에서 해당 사용자의 ticketId와 storeId를 조회
    const usedTickets = await TicketHistoryUsageModel.find({ userId }).exec();
    // Step 3: 각 ticketId에 대해서 구입한 amount와 사용한 amount 차이를 계산
    const ticketMap = {};

    // 구입한 티켓들을 ticketId 기준으로 그룹화
    purchasedTickets.forEach(purchasedTicket => {
      const ticketId = String(purchasedTicket.ticketId._id);
      if (!ticketMap[ticketId]) {
        ticketMap[ticketId] = {
          totalPurchasedTickets: 0,
          totalUsedTickets: 0,
          ticketId: purchasedTicket.ticketId,
        };
      }
      ticketMap[ticketId].totalPurchasedTickets += purchasedTicket.amount;
    });

    // 사용한 티켓들을 ticketId 기준으로 그룹화하여 더함
    usedTickets.forEach(usedTicket => {
      const ticketId = String(usedTicket.ticketId._id);
      if (ticketMap[ticketId]) {
        ticketMap[ticketId].totalUsedTickets += usedTicket.amount;
      }
    });

    // Step 4: 남은 티켓 수가 0보다 큰 경우만 결과에 포함
    const storeIds = [];
    const ticketListInfo = [];

    for (const ticketId in ticketMap) {
      const ticketData = ticketMap[ticketId];
      const remaingingTickets =
        ticketData.totalPurchasedTickets - ticketData.totalUsedTickets;
      if (remaingingTickets > 0) {
        storeIds.push(ticketData.ticketId.storeId);
        console.log(storeIds);
        // const store = await StoreModel.find({
        //   _id: ticketData.ticketId.storeId,
        // });
        // const review = ticketListInfo.push({
        ticketListInfo.push({
          storeId: ticketData.ticketId.storeId,
          ticketAmount: remaingingTickets,
        });
        console.log(ticketListInfo);
      }
    }

    const reviewResults = await ReviewModel.aggregate([
      {
        $match: { storeId: { $in: storeIds } }, // 모든 storeId에 대한 리뷰 필터링
      },
      {
        $lookup: {
          from: 'ReviewScore',
          localField: '_id',
          foreignField: 'reviewId',
          as: 'scores',
        },
      },
      { $unwind: '$scores' },
      {
        $group: {
          _id: '$storeId',
          totalScore: { $sum: '$scores.score' },
          count: { $sum: 1 },
        },
      },
      {
        $addFields: {
          averageScore: {
            $cond: {
              if: { $gt: ['$count', 0] },
              then: { $divide: ['$totalScore', '$count'] },
              else: 0,
            },
          },
        },
      },
    ]);

    // Step 6: storeId에 대한 가게 정보를 가져옴
    const stores = await StoreModel.find({ _id: { $in: storeIds } });
    console.log(stores);

    // Step 7: 리뷰 평균 점수를 storeId별로 매핑
    const reviewMap = {};
    reviewResults.forEach(review => {
      reviewMap[review._id] = review.averageScore;
    });

    // Step 8: store 정보를 storeId로 매핑
    const storeMap = {};
    stores.forEach(store => {
      storeMap[String(store._id)] = store;
    });

    // Step 9: 리뷰 점수와 store 정보를 ticketListInfo에 추가
    const finalResult = ticketListInfo.map(ticketInfo => {
      const store = storeMap[ticketInfo.storeId];
      return {
        ...ticketInfo,
        store, // 가게 정보 추가
        averageScore: reviewMap[ticketInfo.storeId] || 0, // 리뷰 점수 추가
      };
    });

    // 남은 티켓이 있는 store만 응답
    res.json(finalResult);
  } catch (error) {
    res.status(500).json({
      message: '티켓 정보를 불러오는 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
};

// 티켓 사용
const useMyTicket = async (req, res, next) => {
  try {
    const { userId, ticketId, amount } = req.body;
    const ticketUsage = new TicketHistoryUsageModel({
      userId: userId,
      ticketId: ticketId,
      amount: amount,
    });
    await ticketUsage.save();
    res.json({ message: '데이터를 저장 중입니다' });
  } catch (error) {
    next(error);
  }
};

//티켓 충전
const purchaseMyTicket = async (req, res, next) => {
  try {
    const { userId, ticketId } = req.body;
    const { amount } = req.body;

    const ticketPurchase = new TicketHistoryPurchaseModel({
      userId: userId,
      ticketId: ticketId,
      amount: amount,
    });

    await ticketPurchase.save();

    res.json({ message: '메시지 잘 보냇쇼잉 확인해보쇼' });
  } catch (error) {
    next(error);
  }
};

// 티켓 사용 내역 조회
const getMyTicketHistory = async (req, res) => {
  try {
    // 프론트로부터 _id는 토큰으로받고
    const { userId } = req.params;
    //month 와 year는 입력데이터로 받아야함.
    const month = Number(req.query.month); // 문자열을 숫자로 변환
    const year = Number(req.query.year); // 문자열을 숫자로 변환

    // month Index라서 0~11까지라 +1함
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const ticketHistoryUsage = await TicketHistoryUsageModel.find({
      userId,
      created_at: {
        $gte: startDate, // startDate 이상인 데이터 greater than or Equal
        $lt: endDate, // endDate 미만인 데이터 Less than
      },
    });

    const ticketHistoryPurchase = await TicketHistoryPurchaseModel.find({
      userId,
      created_at: {
        $gte: startDate, // startDate 이상인 데이터 greater than or Equal
        $lt: endDate, // endDate 미만인 데이터 Less than
      },
    });

    res.json({ ticketHistoryPurchase, ticketHistoryUsage });
  } catch (error) {
    res
      .status(500)
      .json({ message: '티켓 내역을 불러오는 중 오류가 발생했습니다.' });
  }
};

// 리뷰 목록 조회 -
const getMyReviews = async (req, res) => {
  try {
    const { userId } = req.params;

    // 1. userId로 review와 해당하는 가게 정보 가져옴.
    // 가게 이미지는 쿼리 한번더 진행하는 것이 필요할 것으로 예상 - promise.all에서 처리하는게 좋아보임.
    const reviews = await ReviewModel.find({ userId }).populate('storeId');

    // 2. 모든 리뷰의 평균 점수를 계산
    const reviewsWithAverageScore = await Promise.all(
      reviews.map(async review => {
        // 3. 각 review의 _id로 reviewScore를 가져옴
        const reviewScoreList = await ReviewScoreModel.find({
          reviewId: review._id,
        });
        // 4. score들의 합을 구하고 4로 나눠서 평균을 계산
        // eachScore가 각각 { score : ? } 으로 나오면 그 값들을 .score로 받아오는 것임
        const totalScore = reviewScoreList.reduce(
          (sum, eachScore) => sum + eachScore.score,
          0
        );
        const averageScore = totalScore / 4; // scale이 4개로 고정

        // 5. 리뷰와 평균 점수를 합쳐서 반환
        return {
          ...review.toObject(),
          averageScore, // 추가된 평균 점수
          // 식당 이미지는 여기에 추가할 예정
        };
      })
    );

    // 6. 결과를 JSON으로 반환
    res.json(reviewsWithAverageScore);
  } catch (error) {
    res
      .status(500)
      .json({ message: '리뷰 데이터를 불러오는 중 오류가 발생했습니다.' });
  }
};

// 북마크 조회
const getMyBookmarks = async (req, res) => {
  try {
    const { userId } = req.params;

    // 1. userId로 북마크를 가져오며 storeId도 populate
    const bookmarks = await BookmarkModel.find({ userId }).populate('storeId');

    // 2. 리뷰와 스코어들을 한 번에 처리하는 로직 (Aggregate로 변경)
    const bookmarksWithAverageScores = await Promise.all(
      bookmarks.map(async bookmark => {
        // 3. storeId로 해당하는 리뷰들의 평균 점수를 aggregate로 계산
        const result = await ReviewModel.aggregate([
          {
            $match: { storeId: bookmark.storeId._id }, // 해당 storeId의 리뷰들 필터링
          },
          {
            $lookup: {
              from: 'ReviewScore', // reviewScores 컬렉션과 조인
              localField: '_id',
              foreignField: 'reviewId',
              as: 'scores',
            },
          },
          {
            $unwind: '$scores', // 스코어들을 배열이 아닌 개별 도큐먼트로 풀어줌
          },
          {
            $group: {
              _id: '$storeId', // storeId별로 그룹화
              totalScore: { $sum: '$scores.score' }, // 스코어들의 합 계산
              count: { $sum: 1 }, // 스코어의 개수를 셈
            },
          },
          {
            $addFields: {
              averageScore: {
                $cond: {
                  if: { $gt: ['$count', 0] }, // 리뷰가 하나라도 있을 경우
                  then: { $divide: ['$totalScore', '$count'] }, // 평균 계산 (row 개수만큼 나눔)
                  else: 0, // 없으면 0
                },
              },
            },
          },
        ]);
        console.log(result);
        // 4. 애그리게이션 결과에서 평균 점수 가져오기
        const averageScore = result.length > 0 ? result[0].averageScore : 0;

        // 5. bookmark에 평균 점수 추가
        return {
          ...bookmark.toObject(),
          averageScore, // 추가된 평균 점수
        };
      })
    );

    // 6. 결과를 JSON으로 반환
    res.json(bookmarksWithAverageScores);
  } catch (error) {
    res
      .status(500)
      .json({ message: '북마크 데이터를 불러오는 중 오류가 발생했습니다.' });
  }
};

// 개인 리뷰 삭제
const deleteMyReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { userId } = req.body;

    const deleteReview = await ReviewModel.findOneAndDelete({
      _id: reviewId,
      userId: userId,
    });

    if (!deleteReview) {
      return res.status(404).json({
        message: '해당 사용자의 리뷰를 삭제하지 못하였습니다.',
      });
    }

    res.status(200).json({
      message: '해당 리뷰가 정상적으로 삭제되었습니다',
    });
  } catch {
    res.status(500).json({
      message: '리뷰 삭제 중 오류가 발생하였습니다.',
    });
  }
};

// 특정 가게에 대한 사용자의 티켓 구매 사용 이력조회
const getMyTicketHistoryByStore = async (req, res) => {
  try {
    const { userId, storeId } = req.params; // storeId와 userId를 받아옴
    const month = Number(req.query.month); // month와 year를 쿼리에서 받아옴
    const year = Number(req.query.year);

    // 날짜 필터링 설정
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    // ObjectId 변환 필요 여부 확인 후 변환
    const convertedUserId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;
    const convertedStoreId = mongoose.Types.ObjectId.isValid(storeId)
      ? new mongoose.Types.ObjectId(storeId)
      : storeId;

    // Step 1: storeId에 해당하는 ticketId 찾기
    const tickets = await TicketModel.find({ storeId: convertedStoreId });
    if (!tickets || tickets.length === 0) {
      return res
        .status(404)
        .json({ error: '해당 가게에 대한 티켓이 없습니다.' });
    }
    const ticketIds = tickets.map(ticket => ticket._id); // storeId에 해당하는 모든 ticketId 추출

    // Step 2: 찾은 ticketId로 purchase 데이터 조회
    const purchaseHistory = await TicketHistoryPurchaseModel.find({
      userId: convertedUserId,
      ticketId: { $in: ticketIds }, // ticketIds로 필터링
      created_at: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    // Step 3: 찾은 ticketId로 usage 데이터 조회
    const usageHistory = await TicketHistoryUsageModel.find({
      userId: convertedUserId,
      ticketId: { $in: ticketIds }, // ticketIds로 필터링
      created_at: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    // Step 4: 두 배열을 합치고 시간순서대로 정렬
    const combinedHistory = purchaseHistory
      .concat(usageHistory) // 두 배열을 합침
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at)); // created_at 기준으로 정렬

    // Step 5: 정렬된 데이터 반환
    res.json(combinedHistory);
  } catch (error) {
    console.error('Error during aggregation:', error);
    res
      .status(500)
      .json({ error: '티켓 내역을 불러오는 중 오류가 발생했습니다.' });
  }
};

//여기가 purchase usage 따로 배열로 담는곳
// const getMyTicketHistoryByStore = async (req, res) => {
//   try {
//     const { userId, storeId } = req.params; // storeId와 userId를 받아옴
//     const month = Number(req.query.month); // month와 year를 쿼리에서 받아옴
//     const year = Number(req.query.year);

//     // 날짜 필터링 설정
//     const startDate = new Date(year, month - 1, 1);
//     const endDate = new Date(year, month, 1);

//     // ObjectId 변환 필요 여부 확인 후 변환
//     const convertedUserId = mongoose.Types.ObjectId.isValid(userId)
//       ? new mongoose.Types.ObjectId(userId)
//       : userId;
//     const convertedStoreId = mongoose.Types.ObjectId.isValid(storeId)
//       ? new mongoose.Types.ObjectId(storeId)
//       : storeId;

//     // Step 1: storeId에 해당하는 ticketId 찾기
//     const ticket = await TicketModel.findOne({ storeId: convertedStoreId });
//     if (!ticket) {
//       return res
//         .status(404)
//         .json({ error: "해당 가게에 대한 티켓이 없습니다." });
//     }
//     const ticketId = ticket._id; // storeId에 해당하는 ticketId 추출

//     // Step 2: 찾은 ticketId로 purchase 데이터 조회
//     const purchaseHistory = await TicketHistoryPurchaseModel.find({
//       userId: convertedUserId,
//       ticketId: ticketId,
//       created_at: {
//         $gte: startDate,
//         $lt: endDate,
//       },
//     });

//     // Step 3: 찾은 ticketId로 usage 데이터 조회
//     const usageHistory = await TicketHistoryUsageModel.find({
//       userId: convertedUserId,
//       ticketId: ticketId,
//       created_at: {
//         $gte: startDate,
//         $lt: endDate,
//       },
//     });

//     // Step 4: purchase와 usage 데이터를 배열로 각각 반환
//     res.json({
//       purchaseHistory, // 구매 내역 배열
//       usageHistory, // 사용 내역 배열
//     });
//   } catch (error) {
//     console.error("Error during aggregation:", error);
//     res
//       .status(500)
//       .json({ error: "티켓 내역을 불러오는 중 오류가 발생했습니다." });
//   }
// };

// // 여기는 aggregate로 puchase안에 usage 쑤셔넣는거.
// const getMyTicketHistoryByStore = async (req, res) => {
//   try {
//     const { userId, storeId } = req.params; // storeId와 userId를 받아옴
//     const month = Number(req.query.month); // month와 year를 쿼리에서 받아옴
//     const year = Number(req.query.year);

//     // 날짜 필터링 설정
//     const startDate = new Date(year, month - 1, 1);
//     const endDate = new Date(year, month, 1);

//     // ObjectId 변환 필요 여부 확인 후 변환
//     const convertedUserId = mongoose.Types.ObjectId.isValid(userId)
//       ? new mongoose.Types.ObjectId(userId)
//       : userId;
//     const convertedStoreId = mongoose.Types.ObjectId.isValid(storeId)
//       ? new mongoose.Types.ObjectId(storeId)
//       : storeId;

//     // Step 1: storeId에 해당하는 ticketId 찾기
//     const ticket = await TicketModel.findOne({ storeId: convertedStoreId });
//     if (!ticket) {
//       return res.status(404).json({ error: "해당 가게에 대한 티켓이 없습니다." });
//     }
//     const ticketId = ticket._id; // storeId에 해당하는 ticketId 추출

//     // Step 2: 찾은 ticketId로 purchase와 usage 데이터 조회
//     const ticketHistory = await TicketHistoryPurchaseModel.aggregate([
//       {
//         $match: {
//           userId: convertedUserId,
//           ticketId: ticketId, // ticketId로 필터링
//           created_at: {
//             $gte: startDate,
//             $lt: endDate,
//           },
//         },
//       },
//       {
//         $lookup: {
//           from: "TicketHistoryUsage", // usage 데이터를 가져오기 위한 조인
//           localField: "ticketId",
//           foreignField: "ticketId",
//           as: "usageHistory",
//         },
//       },
//       {
//         $unwind: {
//           path: "$usageHistory",
//           preserveNullAndEmptyArrays: true, // 빈 배열도 유지
//         },
//       },
//       {
//         $match: {
//           $or: [
//             {
//               "usageHistory.created_at": {
//                 $gte: startDate,
//                 $lt: endDate,
//               },
//             },
//             { "usageHistory": { $exists: false } }, // 사용 내역이 없는 경우도 유지
//           ],
//         },
//       },
//     ]);

//     res.json(ticketHistory); // 조회된 결과 반환
//   } catch (error) {
//     console.error("Error during aggregation:", error);
//     res.status(500).json({ error: "티켓 내역을 불러오는 중 오류가 발생했습니다." });
//   }
// };

export {
  getMypage,
  getMySettings,
  updateMySettings,
  getTicketsOwnedByUser,
  useMyTicket,
  purchaseMyTicket,
  getMyTicketHistory,
  getMyReviews,
  getMyBookmarks,
  deleteMyReview,
  getMyTicketHistoryByStore,
};
