import mongoose from 'mongoose';
import schemaOptions from '../common/schemaOptions';

const bookmarkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
  },
  schemaOptions
);

const BookmarkModel = mongoose.model('Bookmark', bookmarkSchema, 'Bookmark');

export default BookmarkModel;
