import mongoose from "mongoose";

const PropuestaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    category: [
      {
        type: String,
        required: true,
      },
    ],
    descripcion: {
      type: String,
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    dislikes: {
      type: Number,
      default: 0,
    },
    img: {
      type: String,
      default: "https://via.placeholder.com/150",
    },
    autor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Propuesta", PropuestaSchema);
