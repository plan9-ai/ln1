import "dotenv/config";
import { appConfig } from "@/app.config";

if (!appConfig.API_TOKEN) {
  console.error("API_TOKEN is not set. Add it to .env.local");
  process.exit(1);
}

const url = `${appConfig.BASE_URL}/api/my/${appConfig.API_TOKEN}/issues`;
const res = await fetch(url);

if (!res.ok) {
  console.error(`Failed to fetch issues: ${res.status} ${res.statusText}`);
  process.exit(1);
}

const issues = await res.json();
console.log(JSON.stringify(issues, null, 2));
