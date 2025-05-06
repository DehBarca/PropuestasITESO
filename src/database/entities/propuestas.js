import { Schema, model } from "mongoose";

const PropuestaSchema = new Schema({
  title: { type: String, required: true },
  category: { type: [String], required: true },
  descripcion: { type: String, required: true },
  date: { type: String, default: Date.now },
  likes: { type: Schema.Types.Int32, default: 0 },
  dislikes: { type: Schema.Types.Int32, default: 0 },
  img: { type: String },
  //   autor: { type: Schema.Types.ObjectId, ref: "usuario" }
});

export default model("Propuesta", PropuestaSchema);
