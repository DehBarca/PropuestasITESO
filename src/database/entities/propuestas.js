import { Schema, model } from "mongoose";
import { User } from "./users.js";

const PropuestaSchema = new Schema({
  title: { type: String, required: true },
  category: { type: [String], required: true },
  descripcion: { type: String, required: true },
  date: { type: String, default: Date.now },
  likes: { type: Schema.Types.Int32, default: 0 },
  dislikes: { type: Schema.Types.Int32, default: 0 },
  img: { type: String },
  autor: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

export default model("Propuesta", PropuestaSchema);
