import { dirname, join } from "path";
import { fileURLToPath } from "url";

const Web_Config_g = {
  PORT: 3000,
  //-->garage ethernet
  SERVER_IP: "10.0.0.53",
  //-->laptop wsl
  // SERVER_IP: "172.30.58.251",
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const __root_dir = join(__dirname, "../../..");

export { Web_Config_g, __dirname, __root_dir };
