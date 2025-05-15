import { Schema, model } from "mongoose";
import { encriptar } from "../../utils/encrypt.js";
import mongoose from "mongoose";

const UserSchema = new Schema({
  user: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Ingrese un formato válido."],
  },
  password: {
    type: String,
    required: true,
  },
  saved: [{ type: mongoose.Schema.Types.ObjectId, ref: "Propuesta" }],
});

UserSchema.pre("save", async function (next) {
  try {
    this.email = String(this.email).toLowerCase();
    // Solo encripta si la contraseña fue modificada y no parece un hash
    if (this.isModified("password") && !this.password.startsWith("$2b$")) {
      this.password = await encriptar(this.password);
    }
    next();
  } catch (error) {
    console.error(error);
    throw error;
  }
});

UserSchema.post("save", function (doc) {
  console.log("Se registro un nuevo usuario.");
});

const userModel = model("User", UserSchema);
export const User = userModel;
