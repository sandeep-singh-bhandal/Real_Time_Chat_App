import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/chatApp`);
    console.log("MongoDB Database connected successfully!");
  } catch (error) {
    console.log(error.message);
    process.exit(1)
  }
};

export default connectDB;
