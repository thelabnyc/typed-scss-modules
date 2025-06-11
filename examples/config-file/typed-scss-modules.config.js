/* eslint-env node */
import fs from "fs";
import path from "path";

export const config = {
    aliases: { "not-real": "test-value" },
    aliasPrefixes: { "also-not-real": "test-value" },
    banner: "// config file banner",
    nameFormat: "kebab",
    exportType: "default",
    importers: [jsonImporter()],
};

function jsonImporter() {
    return {
        canonicalize(url, context) {
            if (!url.endsWith(".json")) {
                return null;
            }

            const baseDir = context.containingUrl
                ? path.dirname(context.containingUrl.pathname)
                : process.cwd();

            const fullPath = path.resolve(baseDir, url);

            if (!fs.existsSync(fullPath)) {
                return null;
            }

            try {
                return new URL(`file://${fullPath}`);
            } catch (err) {
                throw new Error(
                    `Failed to canonicalize JSON from ${url}: ${err}`,
                );
            }
        },

        load(canonicalUrl) {
            try {
                const filePath = canonicalUrl.pathname;
                const json = JSON.parse(fs.readFileSync(filePath, "utf8"));

                const scss = Object.entries(json)
                    .map(([key, value]) => `$${key}: ${JSON.stringify(value)};`)
                    .join("\n");

                return {
                    contents: scss,
                    syntax: "scss",
                };
            } catch (err) {
                throw new Error(
                    `Failed to load JSON from ${canonicalUrl}: ${err}`,
                );
            }
        },
    };
}
