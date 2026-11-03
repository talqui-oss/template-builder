// Checks every catalog entry: required metadata, known taxonomy slugs and no validation errors.
// Usage: node scripts/check-catalog.mjs [file.json ...]   (all entries when no file is given)
import { readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import { validate } from "@talqui-oss/template-builder";

const root = new URL("../catalog/", import.meta.url).pathname;
const taxonomy = JSON.parse(readFileSync(join(root, "taxonomy.json"), "utf8"));
const industries = new Set(taxonomy.industries.map((item) => item.slug));
const useCases = new Set(taxonomy.useCases.map((item) => item.slug));

const files =
  process.argv.length > 2
    ? process.argv.slice(2)
    : readdirSync(join(root, "templates"))
        .filter((file) => file.endsWith(".json"))
        .map((file) => join(root, "templates", file));

let failed = 0;
for (const file of files) {
  const problems = [];
  const slug = basename(file, ".json");
  let entry;
  try {
    entry = JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    problems.push(`invalid JSON: ${error.message}`);
  }
  if (entry) {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug))
      problems.push("file name must be kebab-case");
    for (const field of [
      "title",
      "description",
      "industry",
      "useCase",
      "template",
    ])
      if (!entry[field]) problems.push(`missing "${field}"`);
    if (entry.description && entry.description.length > 160)
      problems.push("description over 160 characters");
    if (
      entry.approvalRate !== undefined &&
      !(entry.approvalRate >= 0 && entry.approvalRate <= 100)
    )
      problems.push("approvalRate must be a number from 0 to 100");
    if (entry.industry && !industries.has(entry.industry))
      problems.push(`unknown industry "${entry.industry}"`);
    if (entry.useCase && !useCases.has(entry.useCase))
      problems.push(`unknown useCase "${entry.useCase}"`);
    if (entry.template) {
      for (const issue of validate(entry.template).issues)
        if (issue.severity === "error")
          problems.push(`${issue.code} at ${issue.path}: ${issue.message}`);
    }
  }
  if (problems.length) {
    failed++;
    console.log(`✗ ${slug}\n  ${problems.join("\n  ")}`);
  }
}
console.log(`${files.length - failed}/${files.length} entries ok`);
process.exit(failed ? 1 : 0);
