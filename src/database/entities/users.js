import { Schema, model } from "mongoose";

const UserSchema = new Schema({
  user: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "user", "guest"],
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

export const User = model("User", UserSchema);
