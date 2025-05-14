import Propuesta from "../database/entities/propuestas.js";
import Interaction from "../database/entities/interactions.js";
import { decodeToken } from "../utils/jwt.js";

class PropuestaService {
  constructor() {}

  getPropuestas = async (page = 1, limit = 6, search = "") => {
    try {
      const skip = (page - 1) * limit;
      let query = {};

      if (search) {
        query = {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } },
          ],
        };
      }

      const [propuestas, total] = await Promise.all([
        Propuesta.find(query)
          .skip(skip)
          .limit(limit)
          .populate("autor", "user email")
          .lean(),
        Propuesta.countDocuments(query),
      ]);

      return {
        items: propuestas,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalItems: total,
      };
    } catch (error) {
      console.error(`No se pueden encontrar las propuestas: `, error);
      throw error;
    }
  };

  getPropuestaByID = async (id) => {
    try {
      return await Propuesta.findById(id);
    } catch (error) {
      console.error(`Propuesta no econtrada: `, error);
    }
  };

  addPropuesta = async (propuesta) => {
    try {
      if (!propuesta.img || propuesta.img.trim() === "") {
        propuesta.img = "https://via.placeholder.com/150";
      }
      const newPropuesta = new Propuesta(propuesta);
      await newPropuesta.save();
      propuesta.id = newPropuesta._id;
      return propuesta;
    } catch (error) {
      console.error(`No se pudo agregar la propuesta: `, error);
    }
  };

  deletePropuesta = async (id) => {
    try {
      return await Propuesta.findByIdAndDelete(id);
    } catch (error) {
      console.error(`No se pudo eliminar la propuesta: `, error);
    }
  };

  updatePropuesta = async (id, propuesta) => {
    try {
      if (!propuesta.img || propuesta.img.trim() === "") {
        propuesta.img = "https://via.placeholder.com/150";
      }
      await Propuesta.findByIdAndUpdate(id, propuesta);
      return true;
    } catch (error) {
      console.error(`No se pudo actualizar la propuesta: `, error);
      return false;
    }
  };

  updateLikes = async (id, token, isLike = true) => {
    try {
      // Decodificar el token para obtener el ID del usuario
      const decoded = decodeToken(token);
      if (!decoded || !decoded.payload.id) {
        throw new Error("Usuario no autorizado");
      }

      const userId = decoded.payload.id;
      const updateField = isLike ? "likes" : "dislikes";

      // Buscar interacción existente
      const existingInteraction = await Interaction.findOne({
        userId,
        propuestaId: id,
      });

      if (existingInteraction) {
        if (existingInteraction.type === (isLike ? "like" : "dislike")) {
          return {
            success: false,
            message: "Ya has interactuado con esta propuesta",
          };
        }

        // Revertir la interacción anterior
        await Propuesta.findByIdAndUpdate(id, {
          $inc: {
            [existingInteraction.type === "like" ? "likes" : "dislikes"]: -1,
          },
        });
        await existingInteraction.deleteOne();
      }

      // Crear nueva interacción
      await Interaction.create({
        userId,
        propuestaId: id,
        type: isLike ? "like" : "dislike",
      });

      // Actualizar contador
      const result = await Propuesta.findByIdAndUpdate(
        id,
        { $inc: { [updateField]: 1 } },
        { new: true }
      );

      return { success: true, data: result };
    } catch (error) {
      console.error(
        `Error al actualizar ${isLike ? "likes" : "dislikes"}: `,
        error
      );
      return { success: false, message: error.message };
    }
  };
}

export default PropuestaService;
