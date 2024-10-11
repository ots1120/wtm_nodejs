import mongoose from 'mongoose';
import schemaOptions from '../common/schemaOptions';

const reviewScaleSchema = new mongoose.Schema(
  {
    taste: {
      type: Number,
      require: true,
      min: 0,
      max: 5,
    },
    cleanliness: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    mood: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    kindness: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
  },
  schemaOptions
);

// ReviewScaleSchema 모델 생성 및 내보내기
const ReviewScaleSchema = mongoose.model('ReviewScale', reviewScaleSchema);

export default ReviewScaleSchema;
