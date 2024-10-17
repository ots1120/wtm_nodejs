import ReviewModel from '../../models/review/ReviewModel';
import ReviewCommentModel from '../../models/review/ReviewCommentModel';
import StoreModel from '../../models/store/StoreModel';
import NoticeModel from '../../models/notice/NoticeModel';
import TicketModel from '../../models/ticket/TicketModel';
import MenuModel from '../../models/menu/MenuModel';
import UserModel from '../../models/user/UserModel';
import mongoose from 'mongoose';

/*
 * 관리자 대시보드 API
 */
const getDashboard = async (req, res) => {
  /**
   * 받아야 할 데이터
   * 1. store.name
   * 2. store.id
   * 3. user.profilePicture
   */
  try {
    const { storeId } = req.params;
    const store = await StoreModel.findById(storeId).populate(
      'adminId',
      'profilePicture'
    );

    if (!store) {
      return res.status(404).json({ error: 'Store를 찾을 수 없습니다.' });
    }
    return res.status(200).json({
      name: store.name,
      id: store._id,
      profilePicture: store.adminId.profilePicture,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: '가게 정보를 불러오지 못했습니다.' });
  }
};

/*
 * 관리자 리뷰 조회 API
 */

// 리뷰 조회 Aggregation Ver
const getReviews = async (req, res) => {
  try {
    const { storeId } = req.params; // 가게 id 가져오기
    const { userId } = req.body; // 로그인한 관리자 id 가져오기

    const objectIdStoreId = new mongoose.Types.ObjectId(storeId);

    const reviews = await ReviewModel.aggregate([
      // 1. ReviewModel에서 해당 store에 관련된 Review만 불러옴
      {
        $match: { storeId: objectIdStoreId },
      },
      // 2. 필터링된 리뷰에서 리뷰 작성자의 정보를 가져옴 (유저 스키마 조인)
      {
        $lookup: {
          from: 'User',
          localField: 'userId',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      // 2-1. 배열 안에 감싸여있는 리뷰 작성자의 정보를 개별 문서로 전환
      {
        $unwind: '$userInfo',
      },
      // 3. 해당 리뷰의 별점 정보를 가져옴 (리뷰 스코어 스키마 조인)
      {
        $lookup: {
          from: 'ReviewScore',
          localField: '_id',
          foreignField: 'reviewId',
          as: 'reviewScores',
        },
      },
      // 4. 가져온 리뷰 별점 평균 계산
      {
        $addFields: {
          averageScore: {
            $cond: {
              if: { $gt: [{ $size: '$reviewScores' }, 0] }, // 조건문
              then: { $avg: '$reviewScores.score' }, // 참일 경우 반환값
              else: 0, // 거짓일 경우 반환값
            },
          },
        },
      },
      // 5. 해당 리뷰의 이미지를 가져옴 (리뷰 이미지 스키마 조인)
      {
        $lookup: {
          from: 'ReviewImg',
          localField: '_id',
          foreignField: 'reviewId',
          as: 'reviewImages',
        },
      },
      // 6. 해당 리뷰의 관리자 코멘트를 가져옴 (리뷰 코멘트 스키마 조인)
      {
        $lookup: {
          from: 'ReviewComment',
          localField: '_id',
          foreignField: 'reviewId',
          as: 'reviewComment',
        },
      },
      {
        $unwind: {
          path: '$reviewComment',
          preserveNullAndEmptyArrays: true,
        },
      },
      //7. 해당 리뷰의 관리자 코멘트 작성자를 가져옴 (유저 스키마 조인)
      {
        $lookup: {
          from: 'User',
          localField: 'reviewComment.userId',
          foreignField: '_id',
          as: 'adminInfo',
        },
      },
      {
        $unwind: {
          path: '$adminInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      // 8. 최종 데이터 포맷
      {
        $project: {
          _id: 0,
          'user.name': 'userInfo.name',
          'user.profilePicture': 'userInfo.profilePicture',
          'review.content': 1,
          'review.averageScore': '$averageScore',
          'review.images': '$reviewImages.url',
          comment: '$reviewComment.content',
          'admin.name': '$adminInfo.name',
          'admin.profilePicture': '$adminInfo.profilePicture',
        },
      },
    ]);
    if (!reviews || reviews.length === 0) {
      console.log(reviews);
      return res.status(404).json({ error: '리뷰 데이터를 찾을 수 없습니다.' });
    }

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (err) {
    console.error('리뷰 가져오기 오류:', err);
    return res
      .status(500)
      .json({ error: '리뷰를 가져오는 중 오류가 발생했습니다.' });
  }
};

// 답글 작성
const createComment = async (req, res) => {
  /**
   * 보내야 할 데이터
   * 1. 리뷰 id Review.id
   * 2. 답글 컨텐츠 ReviewComment.content
   * 3. 답글 작성 user.name
   * 4. 답글 작성 user.profilePicture
   * 5. 답글 작성일자 ReviewComment.createdTime
   */
  try {
    const { reviewId } = req.params; // 답글이 달릴 리뷰의 ID
    const { content } = req.body; // 답글 내용

    //로그인한 관리자 ID 가져오기 현재는 postman 테스트로 body에 userId를 같이 보내주기 때문에 req.body.userId, 나중에 jwt토큰 적용시는 req.userId로 변경
    const userId = req.body.userId;

    console.log(reviewId);
    console.log(content);
    console.log(userId);

    // 필수 값이 누락되었는지 확인
    if (!reviewId || !userId || !content) {
      return res.status(400).json({ error: '모든 필드를 입력해주세요.' });
    }

    // 작성자 정보 가져오기
    const user = await UserModel.findById(userId, 'name profilePicture');
    if (!user) {
      return res.status(404).json({ err: '사용자를 찾을 수 없습니다.' });
    }

    // 새로운 답글 생성
    const newComment = new ReviewCommentModel({
      reviewId: reviewId, // 리뷰 ID
      userId: userId, // 작성자 ID
      content: content, // 답글 내용
      createdTime: Date.now(), //답글 작성일자
    });

    // DB에 저장
    const savedComment = await newComment.save();

    // 성공적으로 저장되면 201 상태와 함께 응답
    return res.status(200).json({
      reviewId: savedComment.reviewId,
      content: savedComment.content,
      user: {
        name: user.name,
        profilePicture: user.profilePicture,
      },
      createdTime: savedComment.createdTime,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: '답글을 작성하는 중 오류가 발생했습니다.' });
  }
};

// 답글 수정
const updateComment = async (req, res) => {
  /**
   *
   * 받아야 할 데이터
   * 1. 수정할 답글 ID reviewComment.id
   * 2. 수정할 답글 content reviewComment.content
   */
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const updatedComment = await ReviewCommentModel.findByIdAndUpdate(
      commentId,
      { content: content },
      { new: true }
    );

    if (!updatedComment) {
      return res.status(404).json({ message: '해당 답글을 찾을 수 없습니다.' });
    }
    return res.status(200).json(updatedComment);
  } catch (err) {
    return res
      .status(500)
      .json({ error: '리뷰를 업데이틑하는 중 오류가 발생했습니다.' });
  }
};

// 답글 삭제
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await ReviewCommentModel.findByIdAndRemove(commentId);
    console.log(commentId);
    if (!comment) {
      return res.status(400).json({ error: '답글을 찾을 수 없습니다.' });
    }
    return res
      .status(200)
      .json({ message: '답글이 성공적으로 삭제되었습니다.' });
  } catch (err) {
    return res
      .status(500)
      .json({ err: '답글을 삭제하는 중 오류가 발생했습니다.' });
  }
};

/*
 * 관리자 공지 조회 API
 */

//공지 조회
const getNotices = async (req, res) => {
  /**
   * 보내야 할 데이터
   * 1. 로그인한 관리자 id
   * 2. 로그인한 관리자 profilePicture
   * 3. 관리자가 작성한 공지
   * 4. 관리자가 작성한 공지 createdTime
   */
  try {
    const { storeId } = req.params;
    console.log(storeId);
    const { userId } = req.body; //관리자 id 가져오기 현재는 body에서 가져오지만 jwt 적용시 req.userId로 가져온다.
    console.log(userId);
    const user = await UserModel.findById(userId, 'name profilePicture');
    console.log(user.name);
    console.log(user.profilePicture);

    const notices = await NoticeModel.find(
      { storeId },
      'title content createdTime'
    );
    console.log(notices);
    if (!notices || notices.length === 0) {
      return res.status(404).json({ error: '공지사항이 없습니다.' });
    }

    if (notices) {
      return res.status(200).json({
        user: {
          name: user.name,
          profilePicture: user.profilePicture,
        },
        notices: notices.map(notice => ({
          title: notice.title,
          content: notice.content,
          createdTime: notice.createdTime,
        })),
        storeId: storeId,
      });
    } else {
      return res.status(400).json({ err: '공지 데이터가 없습니다.' });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ error: '공지 데이터를 가지고 오던 중 에러가 발생했습니다.' });
  }
};

//공지 작성
const createNotices = async (req, res) => {
  /**
   * 보내야 할 데이터
   * 1. storeId
   * 2. userId
   * 3. notice.content
   * 4. notice.title
   */
  try {
    const { storeId } = req.params;
    //관리자 id 가져오기 현재는 body에서 가져오지만 jwt 적용시 req.userId로 가져온다.
    const { userId, title, content } = req.body;

    const newNotices = new NoticeModel({
      storeId: storeId,
      userId: userId,
      title: title,
      content: content,
    });

    if (!newNotices) {
      return res
        .status(404)
        .json({ err: '공지 작성 폼에 오류가 발생했습니다.' });
    }

    const savedNotice = await newNotices.save();

    return res.status(200).json({ savedNotice });
  } catch (err) {
    return res
      .status(500)
      .json({ err: '공지 작성 업로드 중 오류가 발생했습니다.' });
  }
};

//공지 수정을 위한 공지 get
const getNoticeById = async (req, res) => {
  try {
    const { noticeId } = req.params;
    const notice = await NoticeModel.findById(noticeId, 'title, content');

    if (!notice) {
      return res.status(404).json({ err: '불러올 공지 데이터가 없습니다.' });
    }
    return res.status(200).json(notice);
  } catch (error) {
    return res
      .status(500)
      .json({ err: '공지사항을 가져오던 중 오류가 발생하였습니다.' });
  }
};

//공지 수정
const updateNotices = async (req, res) => {
  try {
    const { noticeId } = req.params;
    console.log(noticeId);
    const { title, content } = req.body;

    const updatedNotice = await NoticeModel.findByIdAndUpdate(
      noticeId,
      { title: title, content: content },
      { new: true }
    );
    if (!updatedNotice) {
      return res.status(404).json({ err: '해당 공지를 찾을 수 없습니다.' });
    }
    return res.status(200).json(updatedNotice);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: '공지 수정 중 오류가 발생했습니다.' });
  }
};

//공지 삭제
const deleteNotices = async (req, res) => {
  try {
    const { noticeId } = req.params;

    const deleteNotice = await NoticeModel.findByIdAndRemove(noticeId);

    if (!deleteNotice) {
      return res.status(400).json({ err: '삭제 할 공지 데이터가 없습니다.' });
    }
    return res
      .status(200)
      .json({ message: '공지가 성공적으로 삭제되었습니다.' });
  } catch (err) {
    return res.status(500).json({ err: '공지 삭제 중 오류가 발생했습니다.' });
  }
};

/**
 * 식당 정보 d
 */

// 관리자 식당 정보 조회
const getMyStoreInfo = async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.body.userId; // jwt 미들웨어 적용시 req.userId 로 변경.

    // 현재 프로필 사진 출력을 위한 user_profilePicture 전달.
    const user = await UserModel.findById(userId, 'profilePicture');
    console.log(user);

    if (!user) {
      return res.status(404).json({ err: '유저 정보가 없습니다.' });
    }

    // 식당 정보 조회를 위한 store 정보 전달.
    const myStoreInfo = await StoreModel.findById(storeId);
    console.log(myStoreInfo);

    if (!myStoreInfo) {
      return res.status(404).json({ err: '가게 정보가 없습니다.' });
    }
    return res.status(200).json({
      store: myStoreInfo,
      user: user,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ err: '가게 정보를 불러오는 중 오류가 발생했습니다.' });
  }
};

// 관리자 식당 정보 수정
const updateMyStoreInfo = async (req, res) => {
  try {
    const { storeId } = req.params;
    // 추후 userId는 req.userId로 가져옴 (JWT 미들웨어 이용)
    const {
      name,
      address,
      contact,
      openTime,
      closeTime,
      profilePicture,
      email,
      password,
      userId,
    } = req.body;

    // 프로필 사진 업데이트를 위한 User 모델
    const updatedUserInfo = await UserModel.findByIdAndUpdate(
      userId,
      { profilePicture, email, password },
      { new: true }
    );

    if (!updatedUserInfo) {
      return res
        .status(404)
        .json({ err: '프로필 사진 수정 데이터에 오류가 발생했습니다.' });
    }

    // 가게 정보 수정을 위한 Store 모델
    const updatedMyStoreInfo = await StoreModel.findByIdAndUpdate(
      storeId,
      { name, address, contact, openTime, closeTime },
      { new: true }
    );

    if (!updatedMyStoreInfo) {
      return res
        .status(404)
        .json({ err: '가게 정보 수정 데이터에 오류가 발생했습니다.' });
    }
    return res.status(200).json({
      store: updatedMyStoreInfo,
      user: updatedUserInfo,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ err: '가게 정보 수정 중 오류가 발생했습니다.' });
  }
};

/**
 * 식권 관리
 */

// 식권 조회
const getTickets = async (req, res) => {
  /**
   * 보내야 할 데이터
   */
  try {
    const { storeId } = req.params;
    const tickets = await TicketModel.find().populate('storeId');

    if (!tickets) {
      return res.status(404).json({ err: '티켓 데이터가 없습니다.' });
    }
    return res.status(200).json(tickets);
  } catch (err) {
    return res
      .status(500)
      .json({ err: '티켓 정보를 가져오는 중 오류가 발생했습니다.' });
  }
};

/**
 * 메뉴 관리
 */

//메뉴 조회
const getMenus = async (req, res) => {
  try {
    const { storeId } = req.params;

    const menus = await MenuModel.find().populate('storeId');

    if (!menus) {
      return res.status(404).json({ err: '메뉴 정보가 없습니다' });
    }
    return res.status(200).json(menus);
  } catch (err) {
    return res
      .status(500)
      .json({ err: '메뉴 정보를 불러오는 중 오류가 발생했습니다.' });
  }
};

export {
  getDashboard,
  getReviews,
  createComment,
  updateComment,
  deleteComment,
  getNotices,
  createNotices,
  getNoticeById,
  updateNotices,
  deleteNotices,
  getMyStoreInfo,
  updateMyStoreInfo,
  getTickets,
  getMenus,
};
