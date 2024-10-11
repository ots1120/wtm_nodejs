import mongoose from 'mongoose';
import schemaOptions from '../common/schemaOptions';

const reviewCommentSchema = new mongoose.Schema(
  {
    member: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    },
    review: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
        required: true,
      },
    },
    content: { type: String, requried: true },
  },
  schemaOptions
);

const ReviewCommentModel = mongoose.model('ReviewComment', reviewCommentSchema);

export default ReviewCommentModel;
