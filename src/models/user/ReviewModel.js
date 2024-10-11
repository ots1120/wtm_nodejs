import mongoose from 'mongoose';
import schemaOptions from '../common/schemaOptions';

// Review 스키마 정의
const ReviewSchema = new mongoose.Schema(
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
    ratings: {
      type: mongoose.Schema.Types.ObjectId, // ObjectId를 통해 Rating 참조
      ref: 'Rating', // Rating 컬렉션 참조
      required: true,
    },
    revisit: {
      type: Boolean,
      required: true,
    },
    imageFile: {
      type: String, // 파일 경로나 파일명을 저장
      default: null, // 이미지가 없을 수도 있음
      maxlength: 100,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  schemaOptions
);

// Review 모델 생성 및 내보내기
const ReviewModel = mongoose.model('Review', ReviewSchema);

export default ReviewModel;
