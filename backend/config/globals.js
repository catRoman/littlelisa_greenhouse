import {dirname, resolve} from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

global.__basedir = resolve(__dirname, '..'); 
