import sharp from "sharp";
import { readFileSync } from "fs";
import { join } from "path";

const publicDir = join(import.meta.dir, "..", "public");
const svg = readFileSync(join(publicDir, "favicon.svg"));

await sharp(svg)
  .resize(32, 32)
  .png()
  .toFile(join(publicDir, "favicon-32.png"));

await sharp(svg)
  .resize(32, 32)
  .png()
  .toFile(join(publicDir, "favicon.png"));

await sharp(svg)
  .resize(512, 512)
  .png()
  .toFile(join(publicDir, "ln0-icon-512.png")); // overwrites with LN1 branding

console.log("Generated favicon.png, favicon-32.png, ln0-icon-512.png");
