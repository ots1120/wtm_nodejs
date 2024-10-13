import mongoose from 'mongoose';
import schemaOptions from '../common/schemaOptions';

// Review 스키마 정의
const reviewSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    revisit: {
      type: Boolean,
      required: true,
    },
  },
  schemaOptions
);

// Review 모델 생성 및 내보내기
const ReviewModel = mongoose.model('Review', reviewSchema);

export default ReviewModel;
