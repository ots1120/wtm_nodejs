import ReviewModel from "../../models/review/ReviewModel";
import ReviewCommentModel from "../../models/review/ReviewCommentModel";



/*
* 관리자 리뷰 조회 API
*/
// 리뷰 조회
const getReviews = async (req, res) => {
    try {
        const reviews = await ReviewModel.find({ store: req.params.storeId });
        res.status(200).json(reviews);
    } catch (err) {
        res.status(500).json({ error: '리뷰를 가져오는 중 오류가 발생했습니다.' });
    }
};

// 답글 작성
const createReply = async (req, res) => {
  const {reviewId } = req.params; // storeId와 reviewId 가져오기
    const { content } = req.body; // 요청 본문에서 답글 내용 가져오기
    const memberId = req.user.id; // 로그인된 사용자 정보에서 memberId 가져오기

  try { 
    // 해당 리뷰 찾기
    const review = await ReviewModel.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: '리뷰를 찾을 수 없습니다.' });
    }

    // 새로운 답글 객체 추가
    const newReply = new ReviewCommentModel({
        member: {
            id: memberId,
            name: req.user.name,
            profilePicture: req.user.profilePicture || '',
        },
        review: { id: reviewId },
        content: content,
    });

      await newReply.save();

    res.status(201).json(updatedReview);
  } catch (err) {
    res.status(500).json({ error: '답글을 저장하는 중 오류가 발생했습니다.', err });
  }
};

// 답글 수정
const updateReply = async (req, res) => {
    const { replyId } = req.params;
    const { content } = req.body;

    try {
        const updatedReply = await ReviewComment.findByIdAndUpdate(
            replyId,
            {content: content},
            { new: true }
        );

        if (!updatedReply) {
            return res.status(404).json({ message: '해당 답글을 찾을 수 없습니다.' });
        }
        res.status(200).json(updatedReply);
    } catch (err) {
        res.status(500).json({ error: '리뷰를 업데이틑하는 중 오류가 발생했습니다.' });
    }
};

// 답글 삭제
const deleteReply = async (req, res) => {
    const { replyId } = req.params;

    try {
        const deletedReply = await ReviewComment.findByIdAndDelete(replyId);
        if (!deletedReply) {
            return res.status(404).json({ message: '해당 답글을 찾을 수 없습니다.' });
        }
        res.status(200).json(deletedReply);
    } catch (err) {
        res.status(500).json({ error: '답글을 삭제하는 중 오류가 발생했습니다.' });
    }
};

export {
    getReviews,
    createReply,
    updateReply,
    deleteReply,
};