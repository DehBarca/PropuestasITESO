import fs from "node:fs";
import Propuesta from "../database/entities/propuestas.js";
import { dbConnect, dbDisconnect } from "../database/connections.js";

class PropuestaService {
  constructor() {}

  getPropuestas = async () => {
    try {
      await dbConnect();

      return await Propuesta.find();
    } catch (error) {
      console.error(`No se pueden econtrar las propuestas: `, error);
    } finally {
      await dbDisconnect();
    }
  };

  getPropuestaByID = async (id) => {
    try {
      await dbConnect();

      return await Propuesta.findById(id);
    } catch (error) {
      console.error(`Propuesta no econtrada: `, error);
    } finally {
      await dbDisconnect();
    }
  };

  addPropuesta = async (propuesta) => {
    try {
      await dbConnect();

      const newPropuesta = new Propuesta(propuesta);

      await newPropuesta.save();
      propuesta.id = newPropuesta._id;

      return propuesta;
    } catch (error) {
      console.error(`No se pudo agregar la propuesta: `, error);
    } finally {
      await dbDisconnect();
    }
  };

  deletePropuesta = async (id) => {
    try {
      await dbConnect();

      return await Propuesta.findByIdAndDelete(id);
    } catch (error) {
      console.error(`No se pudo eliminar la propuesta: `, error);
    } finally {
      await dbDisconnect();
    }
  };

  updatePropuesta = async (id, propuesta) => {
    try {
      await dbConnect();

      await Propuesta.findByIdAndUpdate(id, propuesta);
      return true;
    } catch (error) {
      console.error(`No se pudo actualizar la propuesta: `, error);
      return false;
    } finally {
      await dbDisconnect();
    }
  };
}

export default PropuestaService;
