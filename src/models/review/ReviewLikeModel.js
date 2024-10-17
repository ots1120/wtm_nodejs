import mongoose from 'mongoose';
import schemaOptions from '../common/schemaOptions';

const reviewLikeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
      required: true,
    },
  },
  schemaOptions
);

// Rating 모델 생성 및 내보내기
const ReviewLikeModel = mongoose.model(
  'ReviewLike',
  reviewLikeSchema,
  'ReviewLike'
);

export default ReviewLikeModel;
