import "dotenv/config";
import { appConfig } from "@/app.config";

const [issueId] = process.argv.slice(2);

if (!appConfig.API_TOKEN) {
  console.error("API_TOKEN is not set. Add it to .env.local");
  process.exit(1);
}

if (!issueId) {
  console.error("Usage: bun scripts/get-comments.ts <issueId>");
  process.exit(1);
}

const url = `${appConfig.BASE_URL}/api/my/${appConfig.API_TOKEN}/issues/${issueId}/comments`;
const res = await fetch(url);

if (!res.ok) {
  const text = await res.text();
  console.error(`Failed: ${res.status} ${text}`);
  process.exit(1);
}

const comments = await res.json();
console.log(JSON.stringify(comments, null, 2));
