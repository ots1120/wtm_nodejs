import mongoose from 'mongoose';
import schemaOptions from '../../common/schemaOptions';

/*
 * mainMenu, soupMenu, etcMenu
 */
// 메뉴 카테고리 스키마 정의
const menuCategorySchema = new mongoose.Schema(
  {
    // 메뉴가 속한 가게의 storeId
    name: { type: String, required: true },
  },
  schemaOptions
);

const MenuCategoryModel = mongoose.model('MenuCategory', menuCategorySchema);

export default MenuCategoryModel;
