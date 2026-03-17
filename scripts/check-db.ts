import "dotenv/config";
import { SQL } from "bun";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = new SQL(DATABASE_URL);

try {
  const [row] = await sql`SELECT 1 as ok`;
  console.log("✓ Database connection OK:", row);
} catch (err) {
  console.error("✗ Database connection failed:", err);
  process.exit(1);
} finally {
  await sql.close();
}
