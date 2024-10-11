import mongoose from 'mongoose';
import schemaOptions from '../common/schemaOptions';

// Store 스키마 정의
const storeSnsSchema = new mongoose.Schema(
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

const StoreSnsSchema = mongoose.model('StoreSns', storeSnsSchema);

export default StoreSnsSchema;
