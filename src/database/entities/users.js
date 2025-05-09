import { Schema, model } from "mongoose";
import { encriptar } from "../../utils/encrypt.js";

const UserSchema = new Schema({
  user: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "guest",
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Ingrese un formato válido."],
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: function (val) {
        return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/.test(
          val
        );
      },
      message:
        "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un caracter especial",
    },
  },
});

UserSchema.pre("save", async function (next) {
  try {
    this.email = String(this.email).toLowerCase();
    this.password = await encriptar(this.password);
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
