import express from "express";
import cors from "cors";
import Config from "./src/config/config.js";
import propuestaRouter from "./src/routes/propuesta.routes.js";
import userRouter from "./src/routes/user.routes.js";
import { authRouter } from "./src/routes/auth.router.js";
import comentarioRouter from "./src/routes/comentario.routes.js"; // Importa el router de comentarios
import cookieParser from "cookie-parser";
import { checkAuth } from "./src/middlewares/is.authenticated.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { dbConnect } from "./src/database/connections.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Conectar a la base de datos al iniciar la app
dbConnect().catch((err) => {
  console.error("Error al conectar a la base de datos:", err);
  process.exit(1);
});

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://127.0.0.1:5500",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Serve static files
app.use(express.static(join(__dirname, "public")));

// API Routes
app.use("/api/propuesta", propuestaRouter);
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/comentario", comentarioRouter); // Agrega esta línea para registrar el router

app.get(["/login", "/login.html"], (req, res) => {
  res.sendFile(join(__dirname, "public/views/login.html"));
});

app.get(["/registro", "/registro.html"], (req, res) => {
  res.sendFile(join(__dirname, "public/views/registro.html"));
});

app.get("/", (req, res) => {
  const token = req.cookies.jwt; // Verifica si hay un token JWT en las cookies
  if (!token) {
    // Si no hay token, redirige a Home.html
    return res.redirect("/Home.html");
  }

  // Si hay token, verifica el rol del usuario
  const { role } = req.headers;
  if (role === "admin") {
    res.redirect("/home.admin.html");
  } else {
    res.redirect("/HomeLoggedin.html");
  }
});

app.get(["/HomeLoggedin", "/HomeLoggedin.html"], checkAuth, (req, res) => {
  try {
    const { role } = req.headers;
    if (role === "admin") {
      res.redirect("/home.admin.html");
    } else {
      res.sendFile(join(__dirname, "public/views/HomeLoggedin.html"));
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, error: error.message });
  }
});

app.get(["/home.admin", "/home.admin.html"], checkAuth, (req, res) => {
  try {
    const { role } = req.headers;
    if (role !== "admin") {
      res.redirect("/HomeLoggedin.html");
    } else {
      res.sendFile(join(__dirname, "public/views/home.admin.html"));
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, error: error.message });
  }
});

app.get("/Likes.html", (req, res) => {
  res.sendFile(join(__dirname, "public/views/Likes.html"));
});

// Static HTML files route
app.get("/:page.html", (req, res, next) => {
  const page = req.params.page;
  const filePath = join(__dirname, `public/views/${page}.html`);
  res.sendFile(filePath, (err) => {
    if (err) {
      next();
    }
  });
});

// Catch-all route for 404s
app.use((req, res) => {
  res.status(404).sendFile(join(__dirname, "public/views/404.html"));
});

app.listen(Config.PORT, Config.SERVER, () => {
  console.log(`Server running at ${Config.SERVER}:${Config.PORT}`);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});
