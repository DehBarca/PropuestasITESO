import mongoose from "mongoose";

const ComentarioSchema = new mongoose.Schema(
  {
    propuesta: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Propuesta",
      required: true,
    },
    autor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    texto: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Comentario", ComentarioSchema);