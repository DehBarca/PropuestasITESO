import mongoose from "mongoose";

const InteractionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    propuestaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Propuesta",
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "dislike"],
      required: true,
    },
  },
  { timestamps: true }
);

// Índice compuesto único para evitar duplicados
InteractionSchema.index({ userId: 1, propuestaId: 1 }, { unique: true });

export default mongoose.model("Interaction", InteractionSchema);
