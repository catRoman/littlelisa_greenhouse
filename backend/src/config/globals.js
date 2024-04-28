import { dirname, join } from "path";
import { fileURLToPath } from "url";

const Web_Config_g = {
  PORT: 3000,
  SERVER_IP: "localhost",
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const __root_dir = join(__dirname, "../../..");

export { Web_Config_g, __dirname, __root_dir };
