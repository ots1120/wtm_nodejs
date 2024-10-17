import mongoose from 'mongoose';
import schemaOptions from '../common/schemaOptions';

const reviewCommentSchema = new mongoose.Schema(
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
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  schemaOptions
);

// ReviewCommentSchema 모델 생성 및 내보내기
const ReviewCommentModel = mongoose.model(
  'ReviewComment',
  reviewCommentSchema,
  'ReviewComment'
);

export default ReviewCommentModel;
