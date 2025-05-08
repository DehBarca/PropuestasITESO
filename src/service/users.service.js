import fs from "node:fs";
import { User } from "../database/entities/users.js";
import { dbConnect, dbDisconnect } from "../database/connections.js";

class UserService {
  constructor() {}

  getUsers = async () => {
    try {
      await dbConnect();
      return await User.find();
    } catch (error) {
      console.error(`No se pueden encontrar los usuarios: `, error);
    } finally {
      await dbDisconnect();
    }
  };

  getUserByID = async (id) => {
    try {
      await dbConnect();
      return await User.findById(id);
    } catch (error) {
      console.error(`Usuario no encontrado: `, error);
    } finally {
      await dbDisconnect();
    }
  };

  getUserByEmail = async (email) => {
    try {
      await dbConnect();
      return await User.findOne({ email: email.toLowerCase() });
    } catch (error) {
      console.error(`Usuario no encontrado: `, error);
    } finally {
      await dbDisconnect();
    }
  };

  addUser = async (user) => {
    try {
      await dbConnect();
      const newUser = new User(user);
      await newUser.save();
      user.id = newUser._id;
      return user;
    } catch (error) {
      console.error(`No se pudo registrar el usuario: `, error);
    } finally {
      await dbDisconnect();
    }
  };

  updateUser = async (id, user) => {
    try {
      await dbConnect();
      await User.findByIdAndUpdate(id, user);
      return true;
    } catch (error) {
      console.error(`No se pudo actualizar el usuario: `, error);
      return false;
    } finally {
      await dbDisconnect();
    }
  };

  deleteUser = async (id) => {
    try {
      await dbConnect();
      return await User.findByIdAndDelete(id);
    } catch (error) {
      console.error(`No se pudo eliminar el usuario: `, error);
    } finally {
      await dbDisconnect();
    }
  };
}

export default UserService;
