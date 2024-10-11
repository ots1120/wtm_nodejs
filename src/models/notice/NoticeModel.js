import mongoose from 'mongoose';
import schemaOptions from '../common/schemaOptions';

// 공지사항 스키마 정의
const noticeSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store', // Store 모델과의 관계 설정
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: String,
    content: String,
  },
  schemaOptions
);

const NoticeModel = mongoose.model('Notice', noticeSchema);

export default NoticeModel;
