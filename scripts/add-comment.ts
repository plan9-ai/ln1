import "dotenv/config";
import { appConfig } from "@/app.config";

const [issueId, ...bodyParts] = process.argv.slice(2);
const body = bodyParts.join(" ");

if (!appConfig.API_TOKEN) {
  console.error("API_TOKEN is not set. Add it to .env.local");
  process.exit(1);
}

if (!issueId || !body) {
  console.error(
    'Usage: bun scripts/add-comment.ts <issueId> <comment text>'
  );
  process.exit(1);
}

const url = `${appConfig.BASE_URL}/api/my/${appConfig.API_TOKEN}/issues/${issueId}/comments`;
const res = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ body }),
});

if (!res.ok) {
  const text = await res.text();
  console.error(`Failed: ${res.status} ${text}`);
  process.exit(1);
}

console.log(`Comment added to issue ${issueId}`);
