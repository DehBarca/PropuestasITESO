import express from "express";
import cors from "cors";
import Config from "./src/config/config.js";
import propuestaRouter from "./src/routes/propuesta.routes.js";
import userRouter from "./src/routes/user.routes.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

// Rutas API
app.use("/api/propuesta", propuestaRouter);
app.use("/api/auth", userRouter);

app.get("/login", (req, res) =>
  res.sendFile(import.meta.dirname + "/public/views/login.html")
);
app.get("/registrarse", (req, res) =>
  res.sendFile(import.meta.dirname + "/public/views/registro.html")
);
app.get("/", (req, res) => res.redirect("/home"));

app.get(
  "/home",
  [checkAuth],
  (req = express.request, res = express.response) => {
    try {
      const { role } = req.headers;
      if (role == "admin") {
        res.sendFile(import.meta.dirname + "/public/views/home.admin.html");
      } else {
        res.sendFile(import.meta.dirname + "/public/views/homeLoggedin.html");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({ status: 500, error: error });
    }
  }
);

app.use(express.static(import.meta.dirname + "/public"));
app.use("/static", express.static(import.meta.dirname + "/public"));

app.listen(Config.PORT, Config.SERVER, () => {
  console.log(`Servidor corriendo ${Config.SERVER}:${Config.PORT}`);
});
