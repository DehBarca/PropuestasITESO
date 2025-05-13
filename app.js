import express from "express";
import cors from "cors";
import Config from "./src/config/config.js";
import propuestaRouter from "./src/routes/propuesta.routes.js";
import userRouter from "./src/routes/user.routes.js";
import { authRouter } from "./src/routes/auth.router.js";
import cookieParser from "cookie-parser";
import { checkAuth } from "./src/middlewares/is.authenticated.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(
  cors({
    origin: "http://127.0.0.1:5500",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Serve static files
app.use(express.static(join(__dirname, "public")));
app.use(express.static(join(__dirname, "public/views")));

// API Routes
app.use("/api/propuesta", propuestaRouter);
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);

// View Routes
app.get(["/login", "/login.html"], (req, res) => {
  res.sendFile(join(__dirname, "public/views/login.html"));
});

app.get(["/registro", "/registro.html"], (req, res) => {
  res.sendFile(join(__dirname, "public/views/registro.html"));
});

app.get("/", checkAuth, (req, res) => {
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
