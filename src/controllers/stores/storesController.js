import mongoose from 'mongoose';
import StoreModel from '../../models/store/StoreModel.js';
import StoreSnsModel from '../../models/store/StoreSnsModel.js';
import BookmarkModel from '../../models/bookmark/BookmarkModel.js';
import MealModel from '../../models/menu/MealModel.js';
import MenuModel from '../../models/menu/MenuModel.js';
import MenuCategoryModel from '../../models/menu/MenuCategoryModel.js';
import MenuImgModel from '../../models/menu/MenuImgModel.js';
import TicketModel from '../../models/ticket/TicketModel.js';
import TicketHistoryPurchaseModel from '../../models/ticket/TicketHistoryPurchaseModel.js';
import TicketHistoryUsageModel from '../../models/ticket/TicketHistoryUsageModel.js';
import ReviewModel from '../../models/review/ReviewModel.js';
import ReviewImgModel from '../../models/review/ReviewImgModel.js';
import ReviewScoreModel from '../../models/review/ReviewScoreModel.js';
import ReviewScaleModel from '../../models/review/ReviewScaleModel.js';
import NoticeModel from '../../models/notice/NoticeModel.js';
import UserModel from '../../models/user/UserModel.js';

/*
 * 가게 정보 API
 */
// 모든 가게 정보 조회
// 가게 목록 조회 컨트롤러

const getAllStores = async (req, res) => {
  try {
    // 1. 모든 가게 정보를 한 번에 가져옴
    const stores = await StoreModel.find();

    // 가게 ID 목록 추출
    const storeIds = stores.map(store => store._id);

    // 2. 해당 가게들의 티켓, 북마크, 리뷰 및 사용자 정보를 병렬로 한 번에 가져오기
    const [tickets, bookmarks, reviews, admins] = await Promise.all([
      TicketModel.find({ storeId: { $in: storeIds } }), // 모든 티켓 가져오기
      BookmarkModel.find({
        userId: '670a3e34dc6751089c16a0ad',
        storeId: { $in: storeIds },
      }), // 북마크 정보 가져오기
      ReviewModel.find({ storeId: { $in: storeIds } }), // 모든 리뷰 가져오기
      UserModel.find({ _id: { $in: stores.map(store => store.adminId) } }), // 모든 admin 정보 가져오기
    ]);

    // 3. 모든 리뷰에 대해 전체 평균 점수 계산 (MongoDB Aggregate 활용)
    const reviewIds = reviews.map(review => review._id); // 모든 리뷰의 ID 추출
    const avgRatingResult = await ReviewScoreModel.aggregate([
      { $match: { reviewId: { $in: reviewIds } } }, // 리뷰 ID로 필터링
      {
        $group: {
          _id: null, // 그룹화하지 않음 (모든 리뷰에 대해 하나의 결과)
          avgRating: { $avg: '$score' }, // 모든 리뷰의 평균 점수 계산
        },
      },
    ]);

    const avgRating =
      avgRatingResult.length > 0 ? avgRatingResult[0].avgRating.toFixed(1) : 0;

    // store 데이터를 처리
    const storeData = stores.map(store => {
      const admin = admins.find(admin => admin._id.equals(store.adminId));
      const img = admin ? admin.profilePicture : null;

      const ticket = tickets.find(t => t.storeId.equals(store._id));
      const price = ticket ? ticket.price : null;

      const isBookmarked = bookmarks.some(bm => bm.storeId.equals(store._id));

      return {
        storeId: store._id,
        name: store.name,
        address: store.address,
        contact: store.contact,
        operatingHours: `${store.openTime} - ${store.closeTime}`,
        price,
        isBookmarked,
        img,
        rating: avgRating, // 모든 리뷰의 평균 점수를 사용
      };
    });

    // 4. 응답 반환
    res.json(storeData);
  } catch (error) {
    console.error('가게 목록 조회 중 오류 발생:', error);
    res
      .status(500)
      .json({ error: '가게 목록을 조회하는 중 오류가 발생했습니다.' });
  }
};

// 특정 가게 정보 조회
/*

*/
const getStoreById = async (req, res) => {
  try {
    const { storeId } = req.params;

    console.log(storeId);

    // Promise.all을 사용해 동시에 여러 쿼리 실행
    const [store, storeSns, Ticket] = await Promise.all([
      StoreModel.findById(storeId), // 가게 정보 조회
      StoreSnsModel.find({ storeId }), // SNS 정보 조회
      TicketModel.find({ storeId }), // 티켓 정보 조회
    ]);
    console.log(storeSns);
    if (!store)
      return res.status(404).json({ error: '식당이 조회되지 않습니다.' });

    res.json({
      store,
      storeSns,
      Ticket,
    });
  } catch (err) {
    res.status(500).json({ error: '가게 정보를 불러오는 데 실패했습니다' });
  }
};

/*
 * 가게 메뉴 정보 API
 */
// 특정 가게에 메뉴 등록 함수
const addMenu = async (req, res) => {
  try {
    const { mainMenu, soupMenu, etcMenus } = req.body;
    const storeId = req.params.storeId;

    //test용 userId 설정
    const userId = new mongoose.Types.ObjectId('670a3e34dc6751089c16a0ad'); // 임의로 설정한 userId
    console.log('테스트용 userId:', userId);

    // Meal 생성 시 현재 날짜를 "YYYY-MM-DD" 형식으로 설정
    const mealDate = new Date().toISOString().split('T')[0];

    // 특정 storeId에 오늘의 Meal이 이미 있는지 확인
    let meal = await MealModel.findOne({ mealDate, storeId });
    if (!meal) {
      meal = new MealModel({ mealDate, storeId });
      await meal.save();
    }

    // 카테고리 찾기 (주메뉴, 국, 기타 메뉴)
    const categories = await Promise.all([
      MenuCategoryModel.findOne({ name: 'Main Menu' }),
      MenuCategoryModel.findOne({ name: 'Soup Menu' }),
      MenuCategoryModel.findOne({ name: 'Etc Menu' }),
    ]);

    const [mainMenuCategory, soupMenuCategory, etcMenuCategory] = categories;

    // 카테고리 확인 (존재하지 않을 경우 처리)
    if (!mainMenuCategory || !soupMenuCategory || !etcMenuCategory) {
      return res.status(400).json({ message: '카테고리가 올바르지 않습니다.' });
    }

    // 메뉴 데이터 생성 - 주메뉴, 국, 기타 메뉴
    const menuItems = [
      { name: mainMenu, categoryId: mainMenuCategory._id },
      { name: soupMenu, categoryId: soupMenuCategory._id },
      ...etcMenus.map(menu => ({
        name: menu,
        categoryId: etcMenuCategory._id,
      })),
    ].map(menu => ({
      storeId,
      userId,
      mealId: meal._id,
      ...menu,
      createdTime: Date.now(),
      updatedTime: Date.now(),
    }));

    // 메뉴 저장 병렬 처리
    await Promise.all(
      menuItems.map(menuItem => new MenuModel(menuItem).save())
    );

    // 메뉴 이미지 저장 (meal과 연관)
    if (req.files) {
      const menuImgs = req.files.map(file => ({
        mealId: meal._id, // 이미지가 meal에 연관되도록 설정
        url: `/res/menuImgs/${file.filename}`, // 이미지 경로 (URL) 추가
        createdTime: Date.now(),
      }));
      await MenuImgModel.insertMany(menuImgs); // 이미지 저장
    }

    res.status(201).json({ message: '메뉴가 성공적으로 등록되었습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '메뉴 등록 중 오류가 발생했습니다.' });
  }
};

// 특정 가게의 오늘 메뉴 및 해당 meal에 대한 이미지 조회
const getMenusByStoreId = async (req, res) => {
  try {
    // 오늘 날짜를 YYYY-MM-DD 형식으로 구하기
    const today = new Date().toISOString().split('T')[0];

    // 오늘의 meal을 찾기 (Meal 모델에서 mealDate로 조회)
    const meal = await MealModel.findOne({ mealDate: today });

    if (!meal) {
      return res.status(404).json({ error: '오늘의 meal을 찾을 수 없습니다.' });
    }

    // Meal ID를 기준으로 해당 가게의 메뉴 찾기
    const menus = await MenuModel.find({
      storeId: req.params.storeId,
      mealId: meal._id,
    });

    if (!menus.length) {
      return res
        .status(404)
        .json({ error: '오늘 해당 가게의 메뉴를 찾을 수 없습니다.' });
    }

    // 해당 mealId와 연관된 모든 이미지 조회
    const mealImages = await MenuImgModel.find({ mealId: meal._id });

    // 응답 데이터 구성: meal, 메뉴 리스트, 이미지 리스트 포함
    const response = {
      meal: {
        mealId: meal._id,
        mealDate: meal.mealDate,
        images: mealImages.map(img => img.url), // meal에 대한 이미지들
      },
      menus: menus.map(menu => ({
        _id: menu._id,
        name: menu.name,
        categoryId: menu.categoryId,
        created_at: menu.createdTime,
        updated_at: menu.updatedTime,
      })),
    };

    // 메뉴와 meal 이미지 데이터를 반환
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '메뉴 조회 중 오류가 발생했습니다.' });
  }
};

//메뉴 삭제
/*
오늘의 meal을 가진 menu들 삭제
1. meal 모델에서 오늘 날자의 meal id 찾기
2. 해당 meal id를 가진 메뉴 삭제
*/
const deleteMenus = async (req, res) => {
  try {
    // 오늘 날짜를 YYYY-MM-DD 형식으로 구하기
    const today = new Date().toISOString().split('T')[0];
    console.log('오늘날짜 :', today);

    // 오늘 날짜에 해당하는 meal 찾기
    const meal = await MealModel.findOne({ mealDate: today });
    if (!meal) {
      return res
        .status(404)
        .json({ error: '오늘의 meal 정보를 찾을 수 없습니다.' });
    }

    // 메뉴 삭제
    const result = await MenuModel.deleteMany({
      mealId: meal._id,
      storeId: req.params.storeId,
    });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: '삭제할 메뉴가 없습니다.' });
    }

    return res
      .status(200)
      .json({ message: `${result.deletedCount}개의 메뉴가 삭제되었습니다.` });
  } catch (err) {
    console.error('메뉴 삭제 중 오류 발생:', err);
    res.status(500).json({ error: '메뉴 삭제에 실패하였습니다.' });
  }
};

/*
 * 가게 식권 정보 API
 */

// 특정 가게의 티켓 정보 조회
// 테스트용 userId 설정 (고정된 값 사용)

const getTicketsByStoreId = async (req, res) => {
  try {
    const { storeId } = req.params;

    // 테스트용 userId 설정 (고정된 값 사용)
    const userId = new mongoose.Types.ObjectId('670a3f39dc6751089c16a0b4');

    // 해당 식당의 정보 조회
    const store = await StoreModel.findById(storeId);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // 구매한 식권 및 사용한 식권 개수를 병렬로 계산
    const [totalPurchasedTickets, totalUsedTickets] = await Promise.all([
      TicketHistoryPurchaseModel.aggregate([
        { $match: { userId } }, // 테스트용 userId로 필터링
        { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
      ]),
      TicketHistoryUsageModel.aggregate([
        { $match: { userId } }, // 테스트용 userId로 필터링
        { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
      ]),
    ]);

    // 남은 식권 개수 계산
    const purchasedAmount = totalPurchasedTickets[0]?.totalAmount || 0; // 구매한 식권 개수
    const usedAmount = totalUsedTickets[0]?.totalAmount || 0; // 사용한 식권 개수
    const remainingTickets = purchasedAmount - usedAmount; // 잔여 식권 개수

    // 응답 데이터를 미리 묶어서 처리
    const responseData = {
      name: store.name, // 식당 이름만 반환
      remainingTickets, // 잔여 식권 개수
    };

    // 응답 데이터 반환
    res.json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch remaining tickets' });
  }
};

/*
 * 가게 리뷰 정보 API
 */

// 특정 가게의 리뷰 작성
const addReview = async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = new mongoose.Types.ObjectId('670a3e34dc6751089c16a0ad'); // 고정된 userId 설정
    const {
      taste,
      cleanliness,
      mood,
      kindness,
      reviewImages,
      content,
      revisit,
    } = req.body;

    // revisit 값을 명시적으로 Boolean으로 변환
    const revisitBoolean = revisit === 'true' || revisit === true;

    // 1. 리뷰 기본 정보 저장
    const newReview = new ReviewModel({
      storeId, // 동일한 이름이라 생략
      userId, // 고정된 userId 사용
      content,
      revisit: revisitBoolean,
    });
    const savedReview = await newReview.save();

    // 2. 별점 카테고리들(taste, cleanliness, mood, kindness)에 대해 ReviewScale에서 scaleId 찾기
    const scales = await ReviewScaleModel.find({
      name: { $in: ['taste', 'cleanliness', 'mood', 'kindness'] },
    });

    if (scales.length !== 4) {
      return res.status(400).json({ message: '리뷰 척도가 누락되었습니다' });
    }

    // 3. 각 항목에 대한 별점을 저장
    const scorePromises = [
      { name: 'taste', score: taste },
      { name: 'cleanliness', score: cleanliness },
      { name: 'mood', score: mood },
      { name: 'kindness', score: kindness },
    ].map(async scoreData => {
      const scale = scales.find(s => s.name === scoreData.name);
      return new ReviewScoreModel({
        reviewId: savedReview._id,
        scaleId: scale._id,
        score: scoreData.score,
      }).save();
    });

    // Promise.all로 모든 별점 저장 처리
    await Promise.all(scorePromises);

    // 4. 이미지 저장 (이미지가 존재할 경우)
    if (reviewImages && reviewImages.length > 0) {
      const imagePromises = reviewImages.map(imgUrl => {
        return new ReviewImgModel({
          reviewId: savedReview._id,
          url: imgUrl, // 클라이언트가 제공한 이미지 URL 사용
        }).save();
      });

      // Promise.all로 모든 이미지 저장 처리
      await Promise.all(imagePromises);
    }

    // 5. 리뷰 등록 완료 응답
    res.status(201).json({
      message: '리뷰가 성공적으로 등록되었습니다.',
      reviewId: savedReview._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '리뷰 등록 중 오류가 발생했습니다.' });
  }
};

// 특정 식당의 리뷰 정보 조회 API
const getReviewsByStoreId = async (req, res) => {
  try {
    const { storeId } = req.params;

    console.log(storeId);

    // 리뷰 개수 및 리뷰 목록을 가져오기 위한 Aggregation
    const reviews = await ReviewModel.aggregate([
      {
        $match: { storeId: new mongoose.Types.ObjectId(storeId) }, // 특정 가게의 리뷰 필터링
      },
      {
        $lookup: {
          from: 'users', // User 컬렉션과 조인
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
          pipeline: [{ $project: { name: 1 } }], // 필요한 필드만 가져옴 (name)
        },
      },
      {
        $unwind: '$user', // user 필드를 펼쳐서 리뷰 작성자 정보 추가
      },
      {
        $lookup: {
          from: 'reviewscores', // ReviewScore 컬렉션과 조인
          localField: '_id',
          foreignField: 'reviewId',
          as: 'scores',
        },
      },
      {
        $lookup: {
          from: 'reviewimgs', // 리뷰 이미지와 조인
          localField: '_id',
          foreignField: 'reviewId',
          as: 'images',
        },
      },
      {
        $lookup: {
          from: 'reviewcomments', // 리뷰에 대한 댓글과 조인
          localField: '_id',
          foreignField: 'reviewId',
          as: 'comments',
        },
      },
      {
        $project: {
          _id: 1,
          user: { name: 1 }, // 작성자 이름
          content: 1, // 리뷰 내용
          revisit: 1, // 재방문 여부
          createdAt: 1, // 작성 날짜
          avgScore: { $avg: '$scores.score' }, // 리뷰 점수의 평균
          images: 1, // 리뷰 이미지
          comments: 1, // 리뷰에 대한 답글
        },
      },
    ]);

    // 리뷰 개수
    const reviewCount = reviews.length;

    // 리뷰 ID 목록 추출 (평균 리뷰 점수 계산에 필요)
    const reviewIds = reviews.map(review => review._id);

    // 평균 점수 계산 병렬 처리
    const [avgReviewScores, avgScaleReviewScores] = await Promise.all([
      // 전체 리뷰 점수 평균 계산
      ReviewScoreModel.aggregate([
        { $match: { reviewId: { $in: reviewIds } } }, // 해당 가게의 리뷰들만 필터링
        { $group: { _id: null, avgTotalScore: { $avg: '$score' } } },
      ]),
      // reviewScale별 평균 리뷰 점수 계산
      ReviewScoreModel.aggregate([
        { $match: { reviewId: { $in: reviewIds } } }, // 해당 가게의 리뷰들만 필터링
        {
          $lookup: {
            from: 'reviewscales', // ReviewScale 컬렉션과 조인
            localField: 'scaleId',
            foreignField: '_id',
            as: 'scale',
          },
        },
        { $unwind: '$scale' }, // scale 필드를 펼쳐서 리뷰 척도 정보 추가
        { $group: { _id: '$scale.name', avgScore: { $avg: '$score' } } },
      ]),
    ]);

    // 전체 평균 점수 가져오기
    const avgTotalScore =
      avgReviewScores.length > 0
        ? avgReviewScores[0].avgTotalScore.toFixed(1)
        : 0;

    // reviewScale별 평균 점수 가져오기
    const scaleAverages = avgScaleReviewScores.map(scale => ({
      reviewScale: scale._id, // reviewScale의 이름
      avgScore: scale.avgScore.toFixed(1), // reviewScale별 평균 점수
    }));

    console.log('avgScaleReviewScores:', avgScaleReviewScores);
    // 결과 응답
    res.json({
      reviewCount, // 리뷰 개수
      reviews, // 리뷰 목록
      avgTotalScore, // 전체 평균 점수
      scaleAverages, // reviewScale별 평균 점수
    });
  } catch (error) {
    console.error('리뷰 및 평균 점수 조회 중 오류 발생:', error);
    res
      .status(500)
      .json({ error: '리뷰와 평균 점수를 조회하는 중 오류가 발생했습니다.' });
  }
};

/*
 * 가게 공지 정보 API
 */

// 특정 가게의 공지사항 조회 (Store 정보 포함)
const getNoticesByStoreId = async (req, res) => {
  try {
    // 공지사항을 가져오고 storeId를 populate하여 Store 정보를 함께 가져옴
    const notices = await NoticeModel.find({
      storeId: req.params.storeId,
    }).populate('storeId'); // storeId에 해당하는 Store 정보를 함께 가져옴

    // 필요한 데이터만 필터링
    const filteredNotices = notices.map(notice => ({
      storeName: notice.storeId.name, // Store의 이름
      title: notice.title, // 공지사항 제목
      content: notice.content, // 공지사항 내용
      date: notice.created_at, // 작성 날짜
    }));

    console.log(filteredNotices); // 필터링된 데이터 확인

    // 필터링된 데이터만 JSON으로 응답
    res.json(filteredNotices);
  } catch (err) {
    console.error('공지사항을 가져오는 데 실패했습니다:', err);
    res.status(500).json({ error: '공지사항을 가져오는 데 실패했습니다' });
  }
};

export {
  getAllStores,
  getStoreById,
  addMenu,
  getMenusByStoreId,
  deleteMenus,
  getTicketsByStoreId,
  addReview,
  getReviewsByStoreId,
  getNoticesByStoreId,
};
