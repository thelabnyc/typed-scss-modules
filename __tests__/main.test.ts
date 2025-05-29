import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { jest } from "@jest/globals";
import slash from "slash";

import { alerts } from "../lib/core/index.ts";
import { main } from "../lib/main.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("main", () => {
    let writeFileSpy: jest.SpiedFunction<typeof fs.writeFile>;

    beforeEach(() => {
        // Only mock the writes, so the example files can still be read.
        writeFileSpy = jest
            .spyOn(fs, "writeFile")
            .mockImplementation(() => Promise.resolve());

        // Avoid creating directories while running tests.
        jest.spyOn(fs, "mkdir").mockImplementation(() =>
            Promise.resolve(undefined),
        );

        // Avoid console logs showing up.
        jest.spyOn(console, "log").mockImplementation(() => null);

        jest.spyOn(alerts, "error").mockImplementation(() => null);
    });

    afterEach(() => {
        writeFileSpy.mockReset();
    });

    it("generates types for all .scss files when the pattern is a directory", async () => {
        const pattern = `${__dirname}/dummy-styles`;

        await main(pattern, {
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
            additionalData: "$global-red: red;",
            aliases: {
                "~fancy-import": "complex",
                "~another": "style",
            },
            aliasPrefixes: {
                "~": "nested-styles/",
            },
        });

        expect(alerts.error).not.toHaveBeenCalled();
        expect(fs.writeFile).toHaveBeenCalledTimes(9);

        const expectedDirname = slash(path.join(__dirname, "dummy-styles"));

        expect(fs.writeFile).toHaveBeenCalledWith(
            `${expectedDirname}/complex.scss.d.ts`,
            "export declare const nestedAnother: string;\nexport declare const nestedClass: string;\nexport declare const number1: string;\nexport declare const someStyles: string;\nexport declare const whereSelector: string;\n",
        );
        expect(fs.writeFile).toHaveBeenCalledWith(
            `${expectedDirname}/style.scss.d.ts`,
            "export declare const someClass: string;\n",
        );
    });

    it("generates types for all .scss files and ignores files that match the ignore pattern", async () => {
        const pattern = `${__dirname}/dummy-styles`;

        await main(pattern, {
            banner: "",
            watch: false,
            ignoreInitial: false,
            exportType: "named",
            exportTypeName: "ClassNames",
            exportTypeInterface: "Styles",
            listDifferent: false,
            ignore: ["**/style.scss"],
            quoteType: "single",
            updateStaleOnly: false,
            logLevel: "verbose",
            additionalData: "$global-red: red;",
            aliases: {
                "~fancy-import": "complex",
                "~another": "style",
            },
            aliasPrefixes: {
                "~": "nested-styles/",
            },
        });

        expect(alerts.error).not.toHaveBeenCalled();
        expect(fs.writeFile).toHaveBeenCalledTimes(7);

        const expectedDirname = slash(path.join(__dirname, "dummy-styles"));

        expect(fs.writeFile).toHaveBeenCalledWith(
            `${expectedDirname}/complex.scss.d.ts`,
            "export declare const nestedAnother: string;\nexport declare const nestedClass: string;\nexport declare const number1: string;\nexport declare const someStyles: string;\nexport declare const whereSelector: string;\n",
        );

        // Files that should match the ignore pattern.
        expect(fs.writeFile).not.toHaveBeenCalledWith(
            `${expectedDirname}/style.scss.d.ts`,
            expect.anything(),
        );
        expect(fs.writeFile).not.toHaveBeenCalledWith(
            `${expectedDirname}/nested-styles/style.scss.d.ts`,
            expect.anything(),
        );
    });
});
