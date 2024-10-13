import mongoose from 'mongoose';
import schemaOptions from '../common/schemaOptions';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 50,
    },
    role: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    profilePicture: {
      type: String,
    },
  },
  schemaOptions
);

const UserModel = mongoose.model('User', userSchema, 'User');

export default UserModel;
