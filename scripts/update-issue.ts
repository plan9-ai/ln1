import "dotenv/config";
import { appConfig } from "@/app.config";

const [issueId, field, ...valueParts] = process.argv.slice(2);
const value = valueParts.join(" ");

if (!appConfig.API_TOKEN) {
  console.error("API_TOKEN is not set. Add it to .env.local");
  process.exit(1);
}

if (!issueId || !field || !value) {
  console.error(
    "Usage: bun scripts/update-issue.ts <issueId> <title|description> <value>"
  );
  process.exit(1);
}

if (field !== "title" && field !== "description") {
  console.error('Field must be "title" or "description"');
  process.exit(1);
}

const url = `${appConfig.BASE_URL}/api/my/${appConfig.API_TOKEN}/issues/${issueId}`;
const res = await fetch(url, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ [field]: value }),
});

if (!res.ok) {
  const text = await res.text();
  console.error(`Failed: ${res.status} ${text}`);
  process.exit(1);
}

console.log(`Issue ${issueId} ${field} updated`);
