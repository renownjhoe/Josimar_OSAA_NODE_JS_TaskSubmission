import mongoose from 'mongoose';
import 'dotenv/config';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('Atlas connection error:', error.message);
    process.exit(1);
  }
};

export default connectDB;