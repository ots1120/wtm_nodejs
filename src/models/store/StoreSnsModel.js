import mongoose from 'mongoose';
import schemaOptions from '../common/schemaOptions';

// Store 스키마 정의
const storeSnsSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  schemaOptions
);

const StoreSnsModel = mongoose.model('StoreSns', storeSnsSchema, 'StoreSns');

export default StoreSnsModel;
