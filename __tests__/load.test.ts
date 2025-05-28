import path from "node:path";

import { jest } from "@jest/globals";

import { DEFAULT_OPTIONS, loadConfig, mergeOptions } from "../lib/load.ts";

const CONFIG_CASES = [
    "js-default-export",
    "js-module-exports",
    "js-named-export",
    "ts-default-export",
    "ts-named-export",
];

describe("#loadConfig", () => {
    it.each(CONFIG_CASES)(
        "should load the '%s' config file correctly",
        // Spoof the current working directory so when the config file is read
        // we can direct it to any path we want. This makes it easier to test
        // various kinds of configuration files as if they were in the root.
        async (configCaseName) => {
            jest.spyOn(process, "cwd").mockReturnValue(
                path.resolve(`__tests__/configs/${configCaseName}`),
            );

            const config = await loadConfig();

            expect(config).toHaveProperty("banner");
            expect(config).toEqual({ banner: `// ${configCaseName}` });
        },
    );
});

describe("#mergeOptions", () => {
    it("should return the default options by default", () => {
        expect(mergeOptions({}, {})).toEqual(DEFAULT_OPTIONS);
    });

    it("should allow overriding all default options via the CLI options", () => {
        expect(
            mergeOptions(
                {
                    nameFormat: ["kebab"],
                    exportType: "default",
                    exportTypeName: "Classes",
                    exportTypeInterface: "AllStyles",
                    watch: true,
                    ignoreInitial: true,
                    listDifferent: true,
                    ignore: ["path"],
                    quoteType: "double",
                    updateStaleOnly: true,
                    logLevel: "silent",
                    outputFolder: "__generated__",
                    banner: "// override",
                    allowArbitraryExtensions: true,
                },
                {},
            ),
        ).toEqual({
            nameFormat: ["kebab"],
            exportType: "default",
            exportTypeName: "Classes",
            exportTypeInterface: "AllStyles",
            watch: true,
            ignoreInitial: true,
            listDifferent: true,
            ignore: ["path"],
            quoteType: "double",
            updateStaleOnly: true,
            logLevel: "silent",
            outputFolder: "__generated__",
            banner: "// override",
            allowArbitraryExtensions: true,
        });
    });

    it("should allow overriding all default options via the config options", () => {
        const importer = jest.fn();

        expect(
            mergeOptions(
                {},
                {
                    nameFormat: ["kebab"],
                    exportType: "default",
                    exportTypeName: "Classes",
                    exportTypeInterface: "AllStyles",
                    watch: true,
                    ignoreInitial: true,
                    listDifferent: true,
                    ignore: ["path"],
                    quoteType: "double",
                    updateStaleOnly: true,
                    logLevel: "silent",
                    banner: "// override",
                    outputFolder: "__generated__",
                    /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */
                    importer: importer as any,
                    allowArbitraryExtensions: true,
                },
            ),
        ).toEqual({
            nameFormat: ["kebab"],
            exportType: "default",
            exportTypeName: "Classes",
            exportTypeInterface: "AllStyles",
            watch: true,
            ignoreInitial: true,
            listDifferent: true,
            ignore: ["path"],
            quoteType: "double",
            updateStaleOnly: true,
            logLevel: "silent",
            banner: "// override",
            outputFolder: "__generated__",
            /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */
            importer: importer as any,
            allowArbitraryExtensions: true,
        });
    });

    it("should give precedence to CLI options and still merge config-only options", () => {
        const importer = jest.fn();

        expect(
            mergeOptions(
                {
                    nameFormat: ["kebab"],
                    exportType: "default",
                    exportTypeName: "Classes",
                    exportTypeInterface: "AllStyles",
                    watch: true,
                    ignoreInitial: true,
                    listDifferent: true,
                    ignore: ["path"],
                    quoteType: "double",
                    updateStaleOnly: true,
                    logLevel: "silent",
                    banner: "// override",
                    outputFolder: "__cli-generated__",
                    allowArbitraryExtensions: true,
                },
                {
                    nameFormat: ["param"],
                    exportType: "named",
                    exportTypeName: "Classnames",
                    exportTypeInterface: "TheStyles",
                    watch: false,
                    ignoreInitial: false,
                    listDifferent: false,
                    ignore: ["another/path"],
                    quoteType: "single",
                    updateStaleOnly: false,
                    logLevel: "info",
                    banner: "// not override",
                    outputFolder: "__generated__",
                    /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */
                    importer: importer as any,
                },
            ),
        ).toEqual({
            nameFormat: ["kebab"],
            exportType: "default",
            exportTypeName: "Classes",
            exportTypeInterface: "AllStyles",
            watch: true,
            ignoreInitial: true,
            listDifferent: true,
            ignore: ["path"],
            quoteType: "double",
            updateStaleOnly: true,
            logLevel: "silent",
            banner: "// override",
            outputFolder: "__cli-generated__",
            /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */
            importer: importer as any,
            allowArbitraryExtensions: true,
        });
    });

    it("should give ignore undefined CLI options", () => {
        const importer = jest.fn();

        expect(
            mergeOptions(
                {
                    aliases: undefined,
                    aliasPrefixes: undefined,
                    nameFormat: ["kebab"],
                    exportType: "default",
                    exportTypeName: "Classes",
                    exportTypeInterface: "AllStyles",
                    watch: true,
                    ignoreInitial: true,
                    listDifferent: true,
                    ignore: ["path"],
                    quoteType: "double",
                    updateStaleOnly: true,
                    logLevel: "silent",
                    banner: undefined,
                    outputFolder: "__cli-generated__",
                    allowArbitraryExtensions: true,
                },
                {
                    aliases: {},
                    aliasPrefixes: {},
                    nameFormat: ["param"],
                    exportType: "named",
                    exportTypeName: "Classnames",
                    exportTypeInterface: "TheStyles",
                    watch: false,
                    ignoreInitial: false,
                    listDifferent: false,
                    ignore: ["another/path"],
                    quoteType: "single",
                    updateStaleOnly: false,
                    logLevel: "info",
                    banner: "// banner",
                    outputFolder: "__generated__",
                    /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */
                    importer: importer as any,
                    allowArbitraryExtensions: false,
                },
            ),
        ).toEqual({
            aliases: {},
            aliasPrefixes: {},
            nameFormat: ["kebab"],
            exportType: "default",
            exportTypeName: "Classes",
            exportTypeInterface: "AllStyles",
            watch: true,
            ignoreInitial: true,
            listDifferent: true,
            ignore: ["path"],
            quoteType: "double",
            updateStaleOnly: true,
            logLevel: "silent",
            banner: "// banner",
            outputFolder: "__cli-generated__",
            /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */
            importer: importer as any,
            allowArbitraryExtensions: true,
        });
    });
});
