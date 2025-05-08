import express from "express";
import cors from "cors";
import Config from "./src/config/config.js";
import propuestaRouter from "./src/routes/propuesta.routes.js";
import userRouter from "./src/routes/user.routes.js";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api", propuestaRouter);
app.use("/api", userRouter);

app.listen(Config.PORT, Config.SERVER, () => {
  console.log(`Servidor corriendo ${Config.SERVER}:${Config.PORT}`);
});
