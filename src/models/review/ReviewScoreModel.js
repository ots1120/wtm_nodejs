import mongoose from 'mongoose';
import schemaOptions from '../common/schemaOptions';

// Review 스키마 정의
const reviewScoreSchema = new mongoose.Schema(
  {
    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
      required: true,
    },
    scaleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ReviewScale',
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
const ReviewScoreModel = mongoose.model('ReviewScore', reviewScoreSchema);

export default ReviewScoreModel;
