import mongoose from 'mongoose';
import schemaOptions from '../common/schemaOptions';

const reviewImgSchema = new mongoose.Schema(
  {
    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  schemaOptions
);

// Rating 모델 생성 및 내보내기
const ReviewImgModel = mongoose.model('ReviewImg', reviewImgSchema);

export default ReviewImgModel;
