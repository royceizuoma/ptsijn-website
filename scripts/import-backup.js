import fs from "fs";
import path from "path";

const backupFile = process.argv[2];
if (!backupFile) {
  console.error("Usage: node scripts/import-backup.js path/to/backup.json");
  process.exit(1);
}

const absoluteBackupPath = path.resolve(backupFile);
if (!fs.existsSync(absoluteBackupPath)) {
  console.error(`Backup file not found: ${absoluteBackupPath}`);
  process.exit(1);
}

const backupText = fs.readFileSync(absoluteBackupPath, "utf-8");
let backup;
try {
  backup = JSON.parse(backupText);
} catch (error) {
  console.error("Invalid JSON backup file.");
  process.exit(1);
}

const content = backup.content || backup;
const outputPath = path.resolve("src/data/override-content.js");
const fileText = `const overrideContent = ${JSON.stringify(content, null, 2)};
export default overrideContent;
`;
fs.writeFileSync(outputPath, fileText, "utf-8");
console.log(`Imported backup into ${outputPath}`);
