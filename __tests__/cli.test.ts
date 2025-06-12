import { execSync } from "node:child_process";

describe("cli", () => {
    it("should run when no files are found", () => {
        const result = execSync("npm run typed-scss-modules src").toString();

        expect(result).toContain("No files found.");
    });

    describe("examples", () => {
        const expectSuccessfulExecution = (
            result: string,
            expectedFiles: number,
        ) => {
            expect(result).toContain(
                `Found ${expectedFiles} file${expectedFiles === 1 ? "" : "s"}. Generating type definitions...`,
            );
            expect(result).not.toContain("Can't find stylesheet to import.");
            expect(result).not.toContain(
                "File to import not found or unreadable",
            );
        };

        it("should run the basic example without errors", () => {
            const result = execSync(
                `npm run typed-scss-modules "examples/basic/**/*.scss" -- --includePaths examples/basic/core --aliases.~alias variables --banner '// example banner'`,
            ).toString();

            expectSuccessfulExecution(result, 3);
        });

        it("should run the default-export example without errors", () => {
            const result = execSync(
                `npm run typed-scss-modules "examples/default-export/**/*.scss" -- --exportType default --nameFormat kebab --banner '// example banner'`,
            ).toString();

            expectSuccessfulExecution(result, 1);
        });

        it("should run the config-file example without errors", () => {
            const result = execSync(
                `cd examples/config-file && npm run typed-scss-modules "./**/*.scss"`,
            ).toString();

            expectSuccessfulExecution(result, 1);
        });

        it("should run the output-folder example without errors", () => {
            const result = execSync(
                `cd examples/output-folder && npm run typed-scss-modules "./**/*.scss"`,
            ).toString();

            expectSuccessfulExecution(result, 4);
        });
    });
});
