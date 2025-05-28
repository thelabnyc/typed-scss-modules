import path from "node:path";
import { fileURLToPath } from "node:url";

import { jest } from "@jest/globals";

import { ConfigOptions } from "../../lib/core/index.ts";
import { listFilesAndPerformSanityChecks } from "../../lib/core/list-files-and-perform-sanity-checks.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options: ConfigOptions = {
    banner: "",
    watch: false,
    ignoreInitial: false,
    exportType: "named",
    exportTypeName: "ClassNames",
    exportTypeInterface: "Styles",
    listDifferent: true,
    ignore: [],
    quoteType: "single",
    updateStaleOnly: false,
    logLevel: "verbose",
    outputFolder: null,
    allowArbitraryExtensions: false,
};

describe("listAllFilesAndPerformSanityCheck", () => {
    beforeEach(() => {
        console.log = jest.fn();
    });

    it("prints a warning if the pattern matches 0 files", () => {
        const pattern = `${__dirname}/list-different/test.txt`;

        listFilesAndPerformSanityChecks(pattern, options);

        expect(console.log).toHaveBeenCalledWith(
            expect.stringContaining("No files found."),
        );
    });

    it("prints a warning if the pattern matches 1 file", () => {
        const pattern = `${__dirname}/list-different/formatted.scss`;

        listFilesAndPerformSanityChecks(pattern, options);

        expect(console.log).toHaveBeenCalledWith(
            expect.stringContaining("Only 1 file found for"),
        );
    });
});
