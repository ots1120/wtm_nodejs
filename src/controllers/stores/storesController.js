import StoreModel from '../../models/store/StoreModel';
import MenuModel from '../../models/user/menu/MenuModel';
import TicketModel from '../../models/ticket/TicketModel';
import ReviewModel from '../../models/review/ReviewModel';
import ReviewScaleModel from '../../models/review/ReviewScaleModel';
import NoticeModel from '../../models/notice/NoticeModel';

/*
 * 가게 정보 API
 */
// 모든 가게 정보 조회
const getAllStores = async (req, res) => {
  try {
    const stores = await StoreModel.find();
    res.json(stores);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
};

// 특정 가게 정보 조회
const getStoreById = async (req, res) => {
  try {
    const store = await StoreModel.findOne({ storeId: req.params.storeId });
    if (!store) return res.status(404).json({ error: 'Store not found' });
    res.json(store);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch store' });
  }
};

/*
 * 가게 메뉴 정보 API
 */
// 특정 가게에 메뉴 등록
const addMenu = async (req, res) => {
  try {
    const { storeId } = req.params; // URL에서 가게 ID를 추출
    const { mainMenu, soupMenu, etcMenus } = req.body; // 요청 본문에서 메뉴 정보를 추출

    const menuImages = req.files.map((file) => `/uploads/${file.filename}`); // 업로드된 이미지 파일들의 경로를 배열로 만듦
    const store = await StoreModel.findOne({ storeId }); // 데이터베이스에서 가게를 조회
    if (!store) {
      return res.status(404).json({ error: 'Store not found' }); // 가게가 없을 경우 404 응답
    }

    // 새 메뉴 생성
    const newMenu = new MenuModel({
      storeId,
      mainMenu,
      soupMenu,
      etcMenus,
      menuImages,
    });

    // 메뉴를 데이터베이스에 저장
    await newMenu.save();
    res.json({ message: '메뉴가 성공적으로 등록되었습니다.' }); // 성공 응답
  } catch (error) {
    console.error('메뉴 등록 중 오류 발생:', error);
    res.status(500).json({ error: '메뉴 등록 중 오류가 발생했습니다.' }); // 서버 에러 처리
  }
};

// 특정 가게의 메뉴 조회
const getMenusByStoreId = async (req, res) => {
  try {
    const menus = await MenuModel.find({ storeId: req.params.storeId });
    if (!menus.length)
      return res.status(404).json({ error: 'Menus not found' });
    res.json(menus);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch menus' });
  }
};

/*
 * 가게 식권 정보 API
 */

// 특정 가게의 티켓 정보 조회
const getTicketsByStoreId = async (req, res) => {
  try {
    const tickets = await TicketModel.findOne({ storeId: req.params.storeId });
    if (!tickets) return res.status(404).json({ error: 'Tickets not found' });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
};

/*
 * 가게 리뷰 정보 API
 */

const addReview = async (req, res) => {
  try {
    const { storeId } = req.params; // URL에서 가게 ID를 추출

    const store = await StoreModel.findOne({ storeId });
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // 평점 정보 저장
    const newRating = new ReviewScaleModel({
      taste: req.body.taste,
      cleanliness: req.body.cleanliness,
      mood: req.body.mood,
      kindness: req.body.kindness,
    });
    const savedRating = await newRating.save();

    // 리뷰 정보 저장
    const newReview = new ReviewModel({
      storeId: req.params.storeId,
      ratings: savedRating._id, // Rating의 ObjectId를 참조
      revisit: req.body.revisit,
      imageFile: req.body.file,
      content: req.body.content,
    });
    const savedReview = await newReview.save();

    res.status(201).json({
      message: '리뷰가 성공적으로 저장되었습니다.',
      review: savedReview,
    });
  } catch (error) {
    console.error('리뷰 저장 중 오류:', error);
    res.status(500).json({ error: '리뷰 저장 중 오류가 발생했습니다.' });
  }
};

// 특정 가게의 리뷰 조회
const getReviewsByStoreId = async (req, res) => {
  try {
    const reviews = await ReviewModel.find({
      storeId: req.params.storeId,
    }).populate('ratings');

    if (!reviews.length)
      return res.status(404).json({ error: '리뷰가 없습니다.' });
    res.json(reviews); // 리뷰 데이터와 함께 평점도 응답으로 전송함
  } catch (err) {
    res.status(500).json({ error: '리뷰를 불러오는 중 오류가 발생했습니다.' });
  }
};

/*
 * 가게 공지 정보 API
 */

// 특정 가게의 공지사항 조회 (Store 정보 포함)
const getNoticesByStoreId = async (req, res) => {
  try {
    const notices = await NoticeModel.find({
      storeId: req.params.storeId,
    }).populate('storeId'); // storeId에 해당하는 Store 정보를 함께 가져옴

    console.log(notices); // 공지사항 데이터가 제대로 있는지 확인

    res.json(notices); // 공지사항과 스토어 정보 반환
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notices' });
  }
};

export {
  getAllStores,
  getStoreById,
  addMenu,
  getMenusByStoreId,
  getTicketsByStoreId,
  addReview,
  getReviewsByStoreId,
  getNoticesByStoreId,
};
