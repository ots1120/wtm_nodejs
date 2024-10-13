import ReviewModel from "../../models/review/ReviewModel";
import ReviewCommentModel from "../../models/review/ReviewCommentModel";
import StoreModel from "../../models/store/StoreModel";
import NoticeModel from "../../models/notice/NoticeModel";

/*
* 관리자 대시보드 API
*/
const getDashboard = async (req, res) => {
  try {
      const storeId = req.params.storeId;
      const store = await StoreModel.findById(storeId);

      if (store) {
          res.status(200).json({
              name: store.name,
              id: store._id
          });
      } else {
          return res.status(404).json({ error: 'Store를 찾을 수 없습니다.' });
      }
  } catch (err) {
      console.log(err);
    res.status(500).json({ error: '가게 정보를 불러오지 못했습니다.' });
  }
};


/*
* 관리자 리뷰 조회 API
*/
// 리뷰 조회
const getReviews = async (req, res) => {
    try {
        const storeId = req.params.storeId;
        const reviews = await ReviewModel.find().populate('storeId').populate('userId');
        if (reviews.length > 0) {
        console.log(storeId);
        res.status(200).json(reviews);            
        } else {
            console.log(storeId);
            res.status(404).json({error: '해당 가게에 대한 리뷰가 없습니다.'})
        }
    } catch (err) {
        res.status(500).json({ error: '리뷰를 가져오는 중 오류가 발생했습니다.' });
    }
};

// 답글 작성
const createComment = async (req, res) => {
    try {
        const { reviewId } = req.params; // 답글이 달릴 리뷰의 ID
        const { userId, content } = req.body; // 작성자와 답글 내용

        // 필수 값이 누락되었는지 확인
        if (!reviewId || !userId || !content) {
            return res.status(400).json({ error: '모든 필드를 입력해주세요.' });
        }

        // 새로운 답글 생성
        const newComment = new ReviewCommentModel({
            reviewId: reviewId,   // 리뷰 ID
            userId: userId,       // 작성자 ID
            content: content      // 답글 내용
        });

        // DB에 저장
        const savedComment = await newComment.save();

        // 성공적으로 저장되면 201 상태와 함께 응답
        res.status(201).json(savedComment);
    } catch (err) {
        res.status(500).json({ error: '답글을 작성하는 중 오류가 발생했습니다.' });
    }
};


// 답글 수정
const updateReply = async (req, res) => {
    
    try {
        const { replyId } = req.params;
        const { content } = req.body;
        const updatedReply = await ReviewCommentModel.findByIdAndUpdate(
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
const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;

        const comment = await ReviewCommentModel.findByIdAndRemove(commentId);
        console.log(commentId);
    if (!comment) {
        return res.status(400).json({ error: '답글을 찾을 수 없습니다.' });
    }
    res.status(200).json({ message: '답글이 성공적으로 삭제되었습니다.' });
    } catch (err) {
        res.status(500).json({ err: '답글을 삭제하는 중 오류가 발생했습니다.' });
    }

};

/*
* 관리자 공지 조회 API
*/

//공지 조회
const getNotices = async (req, res) => {
    try {
        const storeId = req.params.storeId;
        const notices = await NoticeModel.find().populate('storeId').populate('userId');
        if (notices) {
            res.status(200).json(notices);
        } else {
            res.status(400).json({ err: '공지 데이터가 없습니다.' });
        }
    } catch (err) {
        res.status(500).json({ error: '공지 데이터를 가지고 오던 중 에러가 발생했습니다.' })
    }
};

//공지 작성
const createNotices = async (req, res) => {
    try {
        const { storeId } = req.params;
        const { userId, title, content } = req.body;

        const newNotices = new NoticeModel({
            storeId: storeId,
            userId: userId,
            title: title,
            content: content,
        });

        const savedNotice = await newNotices.save();

        res.status(200).json({ savedNotice });
    } catch (err) {
        res.status(500).json({ err: '공지 작성 업로드 중 오류가 발생했습니다.' })
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
            res.status(404).json({ err: '해당 공지를 찾을 수 없습니다.' });
        }
        res.status(200).json(updatedNotice);
        
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: '공지 수정 중 오류가 발생했습니다.' })
    }

};

//공지 삭제
const deleteNotices = async (req, res) => {
    try {
        const { noticeId } = req.params;

        const deleteNotices = await NoticeModel.findByIdAndRemove(noticeId);

        if (!deleteNotices) {
            res.status(400).json({ err: '삭제 할 공지 데이터가 없습니다.' });
        }
        res.status(200).json({message: '공지가 성공적으로 삭제되었습니다.'});
    } catch (err) {
        res.status(500).json({ err: '공지 삭제 중 오류가 발생했습니다.'})
    }
}

export {
    getDashboard,
    getReviews,
    createComment,
    updateReply,
    deleteComment,
    getNotices,
    createNotices,
    updateNotices,
    deleteNotices,
};