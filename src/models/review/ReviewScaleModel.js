import mongoose from 'mongoose';
import schemaOptions from '../common/schemaOptions';

/* 
    name: taste, cleanliness, mood, kindness
 */
const reviewScaleSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      maxlength: 100,
      required: true, 
    },
  },
  schemaOptions,
);
    
// ReviewScaleSchema 모델 생성 및 내보내기
const ReviewScaleModel = mongoose.model('ReviewScale', reviewScaleSchema);

export default ReviewScaleModel