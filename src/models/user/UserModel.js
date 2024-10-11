import mongoose from 'mongoose';
import schemaOptions from '../common/schemaOptions';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 50,
    },
    password: {
      type: String,
      required: true,
    },
    nickname: String,
  },
  schemaOptions
);

const UserModel = mongoose.model('User', userSchema);

export default UserModel;
