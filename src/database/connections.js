import mongoose from "mongoose";
import Config from "../config/config.js";

export const dbConnect = async () => {
  try {
    await mongoose.connect(Config.DB_HOST);
  } catch (error) {
    console.error("Error al conectarse a la base de datos: ", error);
  }
};

export const dbDisconnect = async () => {
  try {
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error al conectarse a la base de datos");
  }
};
