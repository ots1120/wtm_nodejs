import mongoose from 'mongoose';
import schemaOptions from '../common/schemaOptions';

// 공지사항 스키마 정의
const mealSchema = new mongoose.Schema(
  {
    // 시간 단위를 제외한 날짜 필드 생성 (예: 2024-10-11 형식)
    mealDate: {
      type: String,
      unique: true,
      default: () => new Date().toISOString().split('T')[0],
    },
  },
  schemaOptions // createAt, updateAt
);

const MealModel = mongoose.model('Meal', mealSchema, 'Meal');

export default MealModel;
