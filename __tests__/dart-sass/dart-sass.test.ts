import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { jest } from "@jest/globals";
import slash from "slash";

import { alerts } from "../../lib/core/index.ts";
import { main } from "../../lib/main.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("dart-sass", () => {
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

    it("@use support", async () => {
        const pattern = `${__dirname}`;

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
        expect(fs.writeFile).toHaveBeenCalledTimes(1);

        const expectedDirname = slash(__dirname);

        expect(fs.writeFile).toHaveBeenCalledWith(
            `${expectedDirname}/use.scss.d.ts`,
            "export declare const foo: string;\n",
        );
    });
});
