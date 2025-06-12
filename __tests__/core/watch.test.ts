import * as fs from "node:fs/promises";

import { beforeEach, jest } from "@jest/globals";
import * as os from "os";
import * as path from "path";

import { fileExists } from "../../lib/core/file-exists.ts";
import {
    createMatcher,
    getBaseDirectory,
    watch,
} from "../../lib/core/watch.ts";
import { getTypeDefinitionPath } from "../../lib/typescript/get-type-definition-path.ts";

// Setup temp directory for tests
let tempDir: string;

beforeEach(async () => {
    // Create a fresh temp directory for each test
    tempDir = path.join(os.tmpdir(), `tsm-test-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });

    // Create subdirectories we'll need
    await fs.mkdir(path.join(tempDir, "src", "styles"), { recursive: true });
    await fs.mkdir(path.join(tempDir, "src", "components"), {
        recursive: true,
    });
    await fs.mkdir(path.join(tempDir, "other"), { recursive: true });

    // Reset all mocks before each test
    jest.clearAllMocks();
});

afterEach(async () => {
    // Clean up temp directory after each test
    await fs.rm(tempDir, { recursive: true, force: true });
});

// Helper function to wait for a specific condition
const waitFor = (
    condition: () => boolean | Promise<boolean>,
    timeout = 2000,
    interval = 100,
): Promise<void> => {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const checkCondition = async () => {
            const result = await condition();
            if (result) {
                resolve();
                return;
            }
            if (Date.now() - startTime > timeout) {
                reject(
                    new Error(
                        `Timeout waiting for condition after ${timeout}ms`,
                    ),
                );
                return;
            }
            setTimeout(() => {
                checkCondition().catch(console.error);
            }, interval);
        };
        checkCondition().catch(console.error);
    });
};

describe("getBaseDirectory", () => {
    it("returns the directory part of a simple file path", () => {
        expect(getBaseDirectory("src/styles/main.scss")).toBe("src/styles");
    });

    it("returns the part before the first wildcard for a glob pattern", () => {
        expect(getBaseDirectory("src/styles/*.scss")).toBe("src/styles");
    });

    it("handles nested glob patterns", () => {
        expect(getBaseDirectory("src/styles/**/*.scss")).toBe("src/styles");
    });

    it("handles glob patterns in the first segment", () => {
        expect(getBaseDirectory("**/styles/*.scss")).toBe(".");
    });

    it("handles patterns with character classes", () => {
        expect(getBaseDirectory("src/styles/[abc]*.scss")).toBe("src/styles");
    });

    it("handles brace expansions", () => {
        expect(getBaseDirectory("src/styles/{foo,bar}/*.scss")).toBe(
            "src/styles",
        );
    });

    it("returns current directory for patterns with no directory part", () => {
        expect(getBaseDirectory("*.scss")).toBe(".");
    });

    it("returns current directory for empty or invalid patterns", () => {
        expect(getBaseDirectory("")).toBe(".");
    });
});

describe("createMatcher", () => {
    it("matches files that match the pattern", () => {
        const matcher = createMatcher("src/styles/*.scss");

        expect(matcher("src/styles/main.scss")).toBe(true);
        expect(matcher("src/styles/variables.scss")).toBe(true);
        expect(matcher("src/components/button.scss")).toBe(false);
        expect(matcher("src/styles/nested/file.scss")).toBe(false);
    });

    it("handles glob patterns with double asterisks", () => {
        const matcher = createMatcher("src/**/*.scss");

        expect(matcher("src/styles/main.scss")).toBe(true);
        expect(matcher("src/components/button.scss")).toBe(true);
        expect(matcher("src/styles/nested/deeply/file.scss")).toBe(true);
        expect(matcher("other/styles/main.scss")).toBe(false);
    });

    it("respects ignore patterns", () => {
        const matcher = createMatcher("src/**/*.scss", [
            "**/node_modules/**",
            "**/test/**",
        ]);

        expect(matcher("src/styles/main.scss")).toBe(true);
        expect(matcher("src/node_modules/package/style.scss")).toBe(false);
        expect(matcher("src/test/fixture.scss")).toBe(false);
    });

    it("handles a single ignore pattern as string", () => {
        const matcher = createMatcher("src/**/*.scss", "**/node_modules/**");

        expect(matcher("src/styles/main.scss")).toBe(true);
        expect(matcher("src/node_modules/package/style.scss")).toBe(false);
    });

    it("handles patterns with character classes", () => {
        const matcher = createMatcher("src/[abc]*.scss");

        expect(matcher("src/a-file.scss")).toBe(true);
        expect(matcher("src/b-file.scss")).toBe(true);
        expect(matcher("src/c-file.scss")).toBe(true);
        expect(matcher("src/d-file.scss")).toBe(false);
    });
});

describe("watch function", () => {
    it("processes change events for matching files", async () => {
        // Create the pattern relative to our temp directory
        const pattern = path.join(tempDir, "src", "**", "*.scss");

        // Start watching
        const watcher = await watch(pattern, {
            ignoreInitial: true, // Don't process existing files
            watch: true,
            ignore: [],
            exportType: "default",
            banner: "",
            exportTypeName: "ClassNames",
            exportTypeInterface: "Styles",
            listDifferent: false,
            quoteType: "single",
            updateStaleOnly: false,
            logLevel: "verbose",
            outputFolder: null,
            allowArbitraryExtensions: false,
        });

        // Give chokidar time to initialize
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Create a matching file
        const matchingFile = path.join(tempDir, "src", "styles", "main.scss");
        await fs.writeFile(matchingFile, ".test-class { color: red; }", "utf8");

        // Get the expected type definition path
        const typeDefinitionPath = getTypeDefinitionPath(matchingFile, {
            outputFolder: null,
            allowArbitraryExtensions: false,
            banner: "",
            ignore: [],
            ignoreInitial: true,
            exportType: "default",
            exportTypeName: "ClassNames",
            exportTypeInterface: "Styles",
            listDifferent: false,
            quoteType: "single",
            updateStaleOnly: false,
            logLevel: "verbose",
            watch: true,
        });

        // Wait for the type definition file to be created
        await waitFor(() => fileExists(typeDefinitionPath), 3000);

        // Verify the type definition file exists and has the expected content
        expect(await fileExists(typeDefinitionPath)).toBe(true);

        const fileContent = await fs.readFile(typeDefinitionPath, "utf8");
        expect(fileContent).toMatchSnapshot();

        // Close the watcher
        await watcher.close();
    });

    it("ignores change events for non-matching files", async () => {
        // Create the pattern relative to our temp directory
        const pattern = path.join(tempDir, "src", "**", "*.scss");

        // Start watching
        const watcher = await watch(pattern, {
            ignoreInitial: true,
            watch: true,
            ignore: [],
            exportType: "default",
            banner: "",
            exportTypeName: "ClassNames",
            exportTypeInterface: "Styles",
            listDifferent: false,
            quoteType: "single",
            updateStaleOnly: false,
            logLevel: "verbose",
            outputFolder: null,
            allowArbitraryExtensions: false,
        });

        // Give chokidar time to initialize
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Create a non-matching file
        const nonMatchingFile = path.join(tempDir, "src", "styles", "main.css");
        await fs.writeFile(
            nonMatchingFile,
            ".test-class { color: red; }",
            "utf8",
        );

        // Create a corresponding .d.ts path we'll check doesn't exist
        const typeDefinitionPath = nonMatchingFile + ".d.ts";

        // Wait a bit to ensure any events would have been processed
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Verify no type definition file was created for the CSS file
        expect(await fileExists(typeDefinitionPath)).toBe(false);

        // Close the watcher
        await watcher.close();
    });

    it("handles file unlink events for matching files", async () => {
        // Create a file first, so we can delete it
        const matchingFile = path.join(
            tempDir,
            "src",
            "styles",
            "to-delete.scss",
        );
        await fs.writeFile(matchingFile, ".test-class { color: red; }", "utf8");

        // Get the type definition path
        const typeDefinitionPath = getTypeDefinitionPath(matchingFile, {
            outputFolder: null,
            allowArbitraryExtensions: false,
            banner: "",
            ignore: [],
            ignoreInitial: false,
            exportType: "default",
            exportTypeName: "ClassNames",
            exportTypeInterface: "Styles",
            listDifferent: false,
            quoteType: "single",
            updateStaleOnly: false,
            logLevel: "verbose",
            watch: true,
        });

        // Create the pattern relative to our temp directory
        const pattern = path.join(tempDir, "src", "**", "*.scss");

        // Start watching with processInitial to generate the initial .d.ts file
        const watcher = await watch(pattern, {
            ignoreInitial: false, // Process existing files
            watch: true,
            ignore: [],
            exportType: "default",
            banner: "",
            exportTypeName: "ClassNames",
            exportTypeInterface: "Styles",
            listDifferent: false,
            quoteType: "single",
            updateStaleOnly: false,
            logLevel: "verbose",
            outputFolder: null,
            allowArbitraryExtensions: false,
        });

        // Wait for the initial type definition file to be created
        await waitFor(() => fileExists(typeDefinitionPath), 3000);

        // Verify the type definition file exists
        expect(await fileExists(typeDefinitionPath)).toBe(true);

        // Delete the SCSS file
        await fs.rm(matchingFile, { force: true });

        // Wait for the type definition file to be removed
        await waitFor(
            async () => !(await fileExists(typeDefinitionPath)),
            3000,
        );

        // Verify the type definition file was removed
        expect(await fileExists(typeDefinitionPath)).toBe(false);

        // Close the watcher
        await watcher.close();
    });
});
