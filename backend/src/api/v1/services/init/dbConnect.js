import pg from "pg";
import config from "config";

export const db_pool = new pg.Pool({
  host: config.get("db.host"),
  port: config.get("db.port"),
  database: config.get("db.database"),
  user: config.get("db.user"),
  password: config.get("db.password"),
  timezone: "America/Vancouver",
});

db_pool.on("notice", (notice) => {
  console.log("Notice from little_lisa_proto:", notice.message);
});

export function connectToDatabase() {
  db_pool.connect((err) => {
    if (err) {
      console.error("uh oh...connection error", err.stack);
    } else {
      //console.log("Hellow There! Connected to the database");
    }
  });
}
