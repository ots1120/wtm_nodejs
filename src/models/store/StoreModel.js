import mongoose from 'mongoose';
import schemaOptions from '../common/schemaOptions';

// Store 스키마 정의
const storeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    contact: { type: String, required: true },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    openTime: {
      type: String, // TIME 타입은 String으로 변환
      required: true,
    },
    closeTime: {
      type: String, // TIME 타입은 String으로 변환
      required: true,
    },
  },
  schemaOptions
);

const StoreModel = mongoose.model('Store', storeSchema);

export default StoreModel;
