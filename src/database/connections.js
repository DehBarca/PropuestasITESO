import mongoose from "mongoose";

let isConnected = false;

export const dbConnect = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.DB_HOST);
    isConnected = true;
    console.log("DB Connected successfully");
  } catch (error) {
    console.error("Error connecting to database:", error);
    throw error;
  }
};

export const dbDisconnect = async () => {
  if (!isConnected) return;

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log("DB Disconnected successfully");
  } catch (error) {
    console.error("Error disconnecting from database:", error);
    throw error;
  }
};
