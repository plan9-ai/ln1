import "dotenv/config";
import { appConfig } from "@/app.config";

const [issueId, status] = process.argv.slice(2);

if (!appConfig.API_TOKEN) {
  console.error("API_TOKEN is not set. Add it to .env.local");
  process.exit(1);
}

if (!issueId || !status) {
  console.error("Usage: bun scripts/set-issue-status.ts <issueId> <status>");
  process.exit(1);
}

const url = `${appConfig.BASE_URL}/api/my/${appConfig.API_TOKEN}/issues/${issueId}/status`;
const res = await fetch(url, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ status }),
});

if (!res.ok) {
  const text = await res.text();
  console.error(`Failed: ${res.status} ${text}`);
  process.exit(1);
}

console.log(`Issue ${issueId} → ${status}`);