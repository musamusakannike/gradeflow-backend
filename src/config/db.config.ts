import mongoose, { ConnectOptions } from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const connectDB = async (): Promise<void> => {
  const clientOptions: ConnectOptions = {
    serverApi: {
      version: "1",
      strict: true,
      deprecationErrors: true,
    },
  };

  try {
    await mongoose.connect(process.env.MONGODB_URI as string, clientOptions);
    console.log("Connected to database");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1); // Exit the process with failure
  }
};

export default connectDB;
