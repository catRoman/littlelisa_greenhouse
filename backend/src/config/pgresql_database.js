import pg from "pg";
const { Pool } = pg;

const { Client } = pg;

const pool = new Pool({
  host: "10.0.0.204",
  port: 5432,
  database: "little_lisa_proto",
  user: "little_lisa",
  password: "littleLisa",
});

function connectToDatabase() {
  console.log("Hello there");
}

export { connectToDatabase };
