import Propuesta from "../database/entities/propuestas.js";
import Interaction from "../database/entities/interactions.js";
import { decodeToken } from "../utils/jwt.js";

class PropuestaService {
  constructor() {}

  getPropuestas = async (
    page = 1,
    limit = 6,
    search = "",
    userId = null,
    autor = null
  ) => {
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

      if (autor) {
        query.autor = autor;
      }

      const [propuestas, total] = await Promise.all([
        Propuesta.find(query)
          .skip(skip)
          .limit(limit)
          .populate("autor", "user email")
          .lean(),
        Propuesta.countDocuments(query),
      ]);

      // Si hay userId, agrega userLike/userDislike a cada propuesta
      if (userId) {
        const interactions = await Interaction.find({
          userId,
          propuestaId: { $in: propuestas.map((p) => p._id) },
        }).lean();

        propuestas.forEach((p) => {
          const inter = interactions.find(
            (i) => i.propuestaId.toString() === p._id.toString()
          );
          p.userLike = inter?.type === "like";
          p.userDislike = inter?.type === "dislike";
        });
      }

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
      const decoded = decodeToken(token);
      if (!decoded || !decoded.payload.id) {
        throw new Error("Usuario no autorizado");
      }

      const userId = decoded.payload.id;
      const updateField = isLike ? "likes" : "dislikes";
      const oppositeField = isLike ? "dislikes" : "likes";

      // Buscar interacción existente
      const existingInteraction = await Interaction.findOne({
        userId,
        propuestaId: id,
      });

      let userLike = false;
      let userDislike = false;

      if (existingInteraction) {
        if (
          (isLike && existingInteraction.type === "like") ||
          (!isLike && existingInteraction.type === "dislike")
        ) {
          // Si ya existe la misma interacción, quitarla (toggle)
          await Propuesta.findByIdAndUpdate(id, {
            $inc: { [updateField]: -1 },
          });
          await existingInteraction.deleteOne();
        } else {
          // Cambiar de like a dislike o viceversa
          await Propuesta.findByIdAndUpdate(id, {
            $inc: { [updateField]: 1, [oppositeField]: -1 },
          });
          existingInteraction.type = isLike ? "like" : "dislike";
          await existingInteraction.save();
        }
      } else {
        // Crear nueva interacción
        await Interaction.create({
          userId,
          propuestaId: id,
          type: isLike ? "like" : "dislike",
        });
        await Propuesta.findByIdAndUpdate(id, {
          $inc: { [updateField]: 1 },
        });
      }

      // Obtener el estado actualizado
      const propuesta = await Propuesta.findById(id).lean();
      const userInteraction = await Interaction.findOne({
        userId,
        propuestaId: id,
      });

      if (userInteraction) {
        userLike = userInteraction.type === "like";
        userDislike = userInteraction.type === "dislike";
      }

      return {
        success: true,
        data: {
          likes: propuesta.likes,
          dislikes: propuesta.dislikes,
          userLike,
          userDislike,
        },
      };
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
