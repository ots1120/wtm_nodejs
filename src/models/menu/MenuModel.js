import mongoose from 'mongoose';
import schemaOptions from '../../common/schemaOptions';

// 메뉴 스키마 정의
const menuSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true, // Store 모델과의 관계 설정
    }, // 메뉴가 속한 가게의 storeId
    mealId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meal',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: true },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuCategory',
      required: true,
    },
  },
  schemaOptions
);

const MenuModel = mongoose.model('Menu', menuSchema);

export default MenuModel;
