import { Router, request, response } from "express";

import { UserService } from "../service/users.service.js";

const router = Router();

router.post("/login", async (req = request, res = response) => {
  try {
    const { body } = req;
    const [estatus, data] = await UserService.ingresar(body);
    if (estatus) {
      res.cookie("jwt", data, {
        httpOnly: false,
        secure: false,
        sameSite: "strict",
        maxAge: 1000 * 60 * 15,
      });
      const decodedData = { data: { token: data } };
      res.status(200).send(JSON.stringify(decodedData));
    } else {
      res.status(400).send({ response: data });
    }
  } catch (error) {
    res.status(500).send("Error en el servidor. Error: ", error);
  }
});

router.post("/registro", async (req = request, res = response) => {
  try {
    const { body } = req;

    const exito = await UserService.registrar(body);

    if (exito) {
      res.status(201).send();
    } else {
      res.status(400).send("No se logro completar el registro");
    }
  } catch (error) {
    res.status(500).send("Error en el servidor. Error: ", error);
  }
});

router.post("/logout", (req = request, res = response) => {
  try {
    res.clearCookie("jwt");
    res.redirect("login");
  } catch (error) {
    res.status(500).send("Error en el servidor. Error: ", error);
  }
});

export const authRouter = router;
