import mongoose from 'mongoose';
import schemaOptions from '../common/schemaOptions';

const RatingSchema = new mongoose.Schema(
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

// Rating 모델 생성 및 내보내기
const RatingModel = mongoose.model('Rating', RatingSchema);

export default RatingModel;
