import "dotenv/config";
import Bun from "bun";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "files";

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: bun scripts/s3-test.ts <file-path>");
  process.exit(1);
}

const file = Bun.file(filePath);
if (!(await file.exists())) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

const key = `${Date.now()}-${filePath.split("/").at(-1) ?? filePath}`;

const supabase = createAdminClient();
const { data, error } = await supabase.storage
  .from(BUCKET)
  .upload(key, file, { upsert: true });

if (error) {
  console.error("Upload failed:", error.message);
  process.exit(1);
}

console.log("Uploaded:", data.path);
process.exit(0);
