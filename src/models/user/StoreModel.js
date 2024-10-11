import mongoose from 'mongoose';
import schemaOptions from '../common/schemaOptions';

// Store 스키마 정의
const storeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: String, required: true }, // 특정 식당의 별점 평균
    openTime: {
      type: String, // TIME 타입은 String으로 변환
      required: true,
    },
    closeTime: {
      type: String, // TIME 타입은 String으로 변환
      required: true,
    },
    price: Number, // 식권 가격
  },
  schemaOptions
);

const StoreModel = mongoose.model('Store', storeSchema);

export default StoreModel;
