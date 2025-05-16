import mongoose from "mongoose";

const ComentarioSchema = new mongoose.Schema(
  {
    texto: { type: String, required: true },
    autor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    propuesta: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Propuesta",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Comentario", ComentarioSchema);
