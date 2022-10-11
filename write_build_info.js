const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const filePath = path.resolve("dist/build.json");
const commit = execSync("git rev-parse HEAD").toString().trim();
const time = Date.now();
const json = JSON.stringify({ commit, time });
try {
  fs.writeFileSync(filePath, json);
  console.log(`Wrote build details to ${filePath}`);
} catch (err) {
  console.error(`Could not write build details to ${filePath}`, err);
}
