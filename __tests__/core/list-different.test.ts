import path from "node:path";
import { fileURLToPath } from "node:url";

import { jest } from "@jest/globals";

import { listDifferent } from "../../lib/core/index.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("listDifferent", () => {
    let exit: jest.SpiedFunction<typeof process.exit>;

    beforeEach(() => {
        console.log = jest.fn();
        // @ts-expect-error return never
        exit = jest.spyOn(process, "exit").mockImplementation(() => null);
    });

    afterEach(() => {
        exit.mockRestore();
    });

    it("logs invalid type definitions and exits with 1", async () => {
        const pattern = `${__dirname}/../**/*.scss`;

        await listDifferent(pattern, {
            banner: "",
            watch: false,
            ignoreInitial: false,
            exportType: "named",
            exportTypeName: "ClassNames",
            exportTypeInterface: "Styles",
            listDifferent: true,
            aliases: {
                "~fancy-import": "complex",
                "~another": "style",
            },
            aliasPrefixes: {
                "~": "nested-styles/",
            },
            ignore: [],
            quoteType: "single",
            updateStaleOnly: false,
            logLevel: "verbose",
            outputFolder: null,
            allowArbitraryExtensions: false,
        });

        expect(exit).toHaveBeenCalledWith(1);
        expect(console.log).toHaveBeenCalledWith(
            expect.stringContaining(
                `[INVALID TYPES] Check type definitions for`,
            ),
        );
        expect(console.log).toHaveBeenCalledWith(
            expect.stringContaining(`invalid.scss`),
        );
    });

    it("logs nothing and does not exit when formatted using Prettier", async () => {
        const pattern = `${__dirname}/list-different/formatted.scss`;

        await listDifferent(pattern, {
            banner: "",
            watch: false,
            ignoreInitial: false,
            exportType: "default",
            exportTypeName: "ClassNames",
            exportTypeInterface: "Styles",
            listDifferent: true,
            ignore: [],
            quoteType: "single",
            updateStaleOnly: false,
            logLevel: "verbose",
            nameFormat: ["kebab"],
            outputFolder: null,
            allowArbitraryExtensions: false,
        });

        expect(console.log).toHaveBeenCalledTimes(1);
        expect(console.log).toHaveBeenCalledWith(
            expect.stringContaining(`Only 1 file found for`),
        );
        expect(exit).not.toHaveBeenCalled();
    });

    it("logs nothing and does not exit if all files are valid", async () => {
        const pattern = `${__dirname}/../dummy-styles/**/style.scss`;

        await listDifferent(pattern, {
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
        });

        expect(exit).not.toHaveBeenCalled();
        expect(console.log).not.toHaveBeenCalled();
    });

    it("logs not generated type file and exits with 1", async () => {
        const pattern = `${__dirname}/list-different/no-generated.scss`;

        await listDifferent(pattern, {
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
        });

        expect(exit).toHaveBeenCalledWith(1);
        expect(console.log).toHaveBeenCalledWith(
            expect.stringContaining(
                `[INVALID TYPES] Type file needs to be generated for`,
            ),
        );
        expect(console.log).toHaveBeenCalledWith(
            expect.stringContaining(`no-generated.scss`),
        );
    });

    it("ignores ignored files", async () => {
        const pattern = `${__dirname}/list-different/no-generated.scss`;

        await listDifferent(pattern, {
            banner: "",
            watch: false,
            ignoreInitial: false,
            exportType: "named",
            exportTypeName: "ClassNames",
            exportTypeInterface: "Styles",
            listDifferent: true,
            ignore: ["**/no-generated.scss"],
            quoteType: "single",
            updateStaleOnly: false,
            logLevel: "verbose",
            outputFolder: null,
            allowArbitraryExtensions: false,
        });

        expect(exit).not.toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledTimes(1);
        expect(console.log).toHaveBeenCalledWith(
            expect.stringContaining(`No files found`),
        );
    });
});
