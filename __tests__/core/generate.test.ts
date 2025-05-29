import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { jest } from "@jest/globals";

import { generate } from "../../lib/core/index.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("generate", () => {
    beforeEach(() => {
        jest.spyOn(fs, "writeFile").mockImplementation(() => Promise.resolve());
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it("generates types for all files matching the pattern", async () => {
        const pattern = `${__dirname}/../dummy-styles/**/*.scss`;

        await generate(pattern, {
            banner: "",
            watch: false,
            ignoreInitial: false,
            exportType: "named",
            exportTypeName: "ClassNames",
            exportTypeInterface: "Styles",
            listDifferent: false,
            ignore: [],
            quoteType: "single",
            updateStaleOnly: false,
            logLevel: "verbose",
            outputFolder: null,
            allowArbitraryExtensions: false,
        });

        expect(fs.writeFile).toHaveBeenCalledTimes(6);
    });
});
