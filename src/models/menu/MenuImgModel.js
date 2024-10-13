import mongoose from 'mongoose';
import schemaOptions from '../common/schemaOptions';

// 메뉴 스키마 정의
const menuImgSchema = new mongoose.Schema(
  {
    mealId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meal',
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  schemaOptions
);

const MenuImgModel = mongoose.model('MenuImg', menuImgSchema, 'MenuImg');

export default MenuImgModel;
