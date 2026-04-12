import "dotenv/config";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { appConfig } from "@/app.config";

if (!appConfig.API_TOKEN) {
  console.error("API_TOKEN is not set. Add it to .env.local");
  process.exit(1);
}

const url = `${appConfig.BASE_URL}/api/my/${appConfig.API_TOKEN}/projects`;
const res = await fetch(url);

if (!res.ok) {
  console.error(`Failed to fetch projects: ${res.status} ${res.statusText}`);
  process.exit(1);
}

interface Project {
  id: number;
  title: string;
  repository: string | null;
  teamSlug: string;
}

const projects: Project[] = await res.json();

if (projects.length === 0) {
  console.log("No projects found.");
  process.exit(0);
}

const projectsDir = join(process.cwd(), "projects");
await mkdir(projectsDir, { recursive: true });

for (const project of projects) {
  console.log(
    `[${project.teamSlug}] ${project.title} — ${project.repository || "(no repository)"}`
  );

  if (!project.repository) continue;

  const targetDir = join(projectsDir, project.teamSlug, project.title);
  if (existsSync(targetDir)) {
    console.log(`  ↳ already exists, pulling...`);
    const pull = Bun.spawnSync(["git", "pull"], { cwd: targetDir });
    if (pull.exitCode !== 0) {
      console.error(`  ↳ git pull failed: ${pull.stderr.toString()}`);
    }
    continue;
  }

  const teamDir = join(projectsDir, project.teamSlug);
  await mkdir(teamDir, { recursive: true });

  console.log(`  ↳ cloning...`);
  const clone = Bun.spawnSync(
    ["git", "clone", project.repository, project.title],
    { cwd: teamDir }
  );
  if (clone.exitCode !== 0) {
    console.error(`  ↳ git clone failed: ${clone.stderr.toString()}`);
  }
}

console.log("\nDone.");
