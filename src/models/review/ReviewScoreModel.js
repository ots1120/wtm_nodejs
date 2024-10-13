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
    score: { 
      type: Number, 
      min: 1, 
      max: 5,
      required: true, 
    },
  },
  schemaOptions
);

// Review 모델 생성 및 내보내기
const ReviewScoreModel = mongoose.model('ReviewScore', reviewScoreSchema, 'ReviewScore');

export default ReviewScoreModel;
