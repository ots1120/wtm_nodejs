import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// mongo db
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true, // 최신 버전에서는 useUnifiedTopology를 사용하는 것이 권장됨
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

export default connectDB;
