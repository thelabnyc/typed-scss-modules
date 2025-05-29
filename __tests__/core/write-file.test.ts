import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { jest } from "@jest/globals";

import { writeFile } from "../../lib/core/index.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("writeFile", () => {
    beforeEach(() => {
        // Only mock the write, so the example files can still be read.
        jest.spyOn(fs, "writeFile").mockImplementation(() => Promise.resolve());
        // Avoid creating new directories while running tests.
        jest.spyOn(fs, "mkdir").mockImplementation(() =>
            Promise.resolve(undefined),
        );
        // Test removing existing types.
        jest.spyOn(fs, "unlink").mockImplementation(() => Promise.resolve());
        jest.spyOn(console, "log");
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it("writes the corresponding type definitions for a file and logs", async () => {
        const testFile = path.resolve(
            __dirname,
            "..",
            "dummy-styles/style.scss",
        );

        await writeFile(testFile, {
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

        const expectedPath = path.join(
            process.cwd(),
            "__tests__/dummy-styles/style.scss.d.ts",
        );

        expect(fs.writeFile).toHaveBeenCalledWith(
            expectedPath,
            "export declare const someClass: string;\n",
        );
        expect(console.log).toHaveBeenCalledWith(
            expect.stringContaining(`[GENERATED TYPES] ${expectedPath}`),
        );
    });

    it("writes the corresponding type definitions for a file and logs when allowArbitraryExtensions is set", async () => {
        const testFile = path.resolve(
            __dirname,
            "..",
            "dummy-styles/style.scss",
        );

        await writeFile(testFile, {
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
            allowArbitraryExtensions: true,
        });

        const expectedPath = path.join(
            process.cwd(),
            "__tests__/dummy-styles/style.d.scss.ts",
        );

        expect(fs.writeFile).toHaveBeenCalledWith(
            expectedPath,
            "export declare const someClass: string;\n",
        );
        expect(console.log).toHaveBeenCalledWith(
            expect.stringContaining(`[GENERATED TYPES] ${expectedPath}`),
        );
    });

    it("skips files with no classes", async () => {
        const testFile = path.resolve(
            __dirname,
            "..",
            "dummy-styles/empty.scss",
        );

        await writeFile(testFile, {
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

        expect(fs.writeFile).not.toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith(
            expect.stringContaining(`[NO GENERATED TYPES] ${testFile}`),
        );
    });

    describe("when a file already exists with type definitions", () => {
        const testFile = path.resolve(
            __dirname,
            "..",
            "dummy-styles/empty.scss",
        );
        const existingTypes = path.join(
            process.cwd(),
            "__tests__/dummy-styles/empty.scss.d.ts",
        );
        const originalExistsSync = fs.access;

        beforeEach(() => {
            jest.spyOn(fs, "access").mockImplementation((p) =>
                p === existingTypes ? Promise.resolve() : originalExistsSync(p),
            );
        });

        afterEach(() => {
            (fs.access as jest.Mock).mockRestore();
        });

        it("removes existing type definitions if no classes are found", async () => {
            await writeFile(testFile, {
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

            expect(fs.unlink).toHaveBeenCalledWith(existingTypes);
            expect(console.log).toHaveBeenCalledWith(
                expect.stringContaining(`[REMOVED] ${existingTypes}`),
            );
        });
    });

    describe("when outputFolder is passed", () => {
        it("should write to the correct path", async () => {
            const testFile = path.resolve(
                __dirname,
                "..",
                "dummy-styles/style.scss",
            );

            await writeFile(testFile, {
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
                outputFolder: "__generated__",
                allowArbitraryExtensions: false,
            });

            const expectedPath = path.join(
                process.cwd(),
                "__generated__/__tests__/dummy-styles/style.scss.d.ts",
            );

            expect(fs.writeFile).toHaveBeenCalledWith(
                expectedPath,
                "export declare const someClass: string;\n",
            );
            expect(console.log).toHaveBeenCalledWith(
                expect.stringContaining(`[GENERATED TYPES] ${expectedPath}`),
            );
        });
    });

    describe("when --updateStaleOnly is passed", () => {
        const originalReadFile = fs.readFile;
        const testFile = path.resolve(
            __dirname,
            "..",
            "dummy-styles/style.scss",
        );
        const expectedPath = path.join(
            process.cwd(),
            "__tests__/dummy-styles/style.scss.d.ts",
        );

        beforeEach(() => {
            jest.spyOn(fs, "stat");
            jest.spyOn(fs, "access");
            jest.spyOn(fs, "readFile");
            (fs.access as jest.Mock).mockImplementation(() =>
                Promise.resolve(),
            );
        });

        afterEach(() => {
            (fs.stat as jest.Mock).mockRestore();
            (fs.access as jest.Mock).mockRestore();
            (fs.readFile as jest.Mock).mockRestore();
        });

        it("skips stale files", async () => {
            (fs.stat as jest.Mock).mockImplementation((p) =>
                Promise.resolve({
                    mtime:
                        p === expectedPath
                            ? new Date(2020, 0, 2)
                            : new Date(2020, 0, 1),
                }),
            );

            await writeFile(testFile, {
                banner: "",
                watch: false,
                ignoreInitial: false,
                exportType: "named",
                exportTypeName: "ClassNames",
                exportTypeInterface: "Styles",
                listDifferent: false,
                ignore: [],
                quoteType: "single",
                updateStaleOnly: true,
                logLevel: "verbose",
                outputFolder: null,
                allowArbitraryExtensions: false,
            });

            expect(fs.writeFile).not.toHaveBeenCalled();
        });

        it("updates files that aren't stale", async () => {
            (fs.stat as jest.Mock).mockImplementation(() =>
                Promise.resolve(new Date(2020, 0, 1)),
            );

            // Mock outdated file contents.
            (fs.readFile as jest.Mock).mockImplementation(
                // @ts-expect-error Mock args
                (
                    p: string,
                    opts?: {
                        encoding?: null | undefined;
                        flag?: string | undefined;
                    } | null,
                ) => (p === expectedPath ? `` : originalReadFile(p, opts)),
            );

            await writeFile(testFile, {
                banner: "",
                watch: false,
                ignoreInitial: false,
                exportType: "named",
                exportTypeName: "ClassNames",
                exportTypeInterface: "Styles",
                listDifferent: false,
                ignore: [],
                quoteType: "single",
                updateStaleOnly: true,
                logLevel: "verbose",
                outputFolder: null,
                allowArbitraryExtensions: false,
            });

            expect(fs.writeFile).toHaveBeenCalled();
        });

        it("skips files that aren't stale but type definition contents haven't changed", async () => {
            (fs.stat as jest.Mock).mockImplementation(() =>
                Promise.resolve(new Date(2020, 0, 1)),
            );

            await writeFile(testFile, {
                banner: "",
                watch: false,
                ignoreInitial: false,
                exportType: "named",
                exportTypeName: "ClassNames",
                exportTypeInterface: "Styles",
                listDifferent: false,
                ignore: [],
                quoteType: "single",
                updateStaleOnly: true,
                logLevel: "verbose",
                outputFolder: null,
                allowArbitraryExtensions: false,
            });

            expect(fs.writeFile).not.toHaveBeenCalled();
        });

        it("doesn't attempt to access a non-existent file", async () => {
            (fs.access as jest.Mock).mockImplementation(() =>
                Promise.reject(new Error()),
            );

            await writeFile(testFile, {
                banner: "",
                watch: false,
                ignoreInitial: false,
                exportType: "named",
                exportTypeName: "ClassNames",
                exportTypeInterface: "Styles",
                listDifferent: false,
                ignore: [],
                quoteType: "single",
                updateStaleOnly: true,
                logLevel: "verbose",
                outputFolder: null,
                allowArbitraryExtensions: false,
            });

            expect(fs.access).not.toHaveBeenCalledWith(testFile);
        });
    });
});
