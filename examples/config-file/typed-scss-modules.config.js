/* eslint-env node */
import fs from "fs";
import path from "path";

export const config = {
    aliases: { "not-real": "test-value" },
    aliasPrefixes: { "also-not-real": "test-value" },
    banner: "// config file banner",
    nameFormat: "kebab",
    exportType: "default",
    importer: jsonImporter,
};

function jsonImporter(url, prev) {
    if (!url.endsWith(".json")) {
        return null;
    }

    const baseDir =
        prev === "stdin" || !path.isAbsolute(prev)
            ? process.cwd()
            : path.dirname(prev);

    const fullPath = path.resolve(baseDir, url);

    if (!fs.existsSync(fullPath)) {
        return null;
    }

    try {
        const json = JSON.parse(fs.readFileSync(fullPath, "utf8"));

        const scss = Object.entries(json)
            .map(([key, value]) => `$${key}: ${JSON.stringify(value)};`)
            .join("\n");

        return {
            contents: scss,
        };
    } catch (err) {
        return new Error(`Failed to load JSON from ${url}: ${err}`);
    }
}
