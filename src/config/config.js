import dotenv from "dotenv";

const envFile = ".env";

dotenv.config({ path: envFile });

class Config {
  static PORT = process.env.PORT || 3000;
  static SERVER = process.env.SERVER;
  static DB_HOST = process.env.DB_HOST;
}

export default Config;
