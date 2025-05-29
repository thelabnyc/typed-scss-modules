import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { jest } from "@jest/globals";

import { alerts } from "../../lib/core/alerts.ts";
import { removeSCSSTypeDefinitionFile } from "../../lib/core/remove-file.ts";
import { DEFAULT_OPTIONS } from "../../lib/load.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("removeFile", () => {
    const originalTestFile = path.resolve(__dirname, "..", "removable.scss");
    const existingFile = path.resolve(__dirname, "..", "style.scss");
    const existingTypes = path.join(
        process.cwd(),
        "__tests__/removable.scss.d.ts",
    );
    const outputFolderExistingTypes = path.resolve(
        process.cwd(),
        "__generated__/__tests__/removable.scss.d.ts",
    );

    let accessSpy: jest.SpiedFunction<typeof fs.access>;
    let unlinkSpy: jest.SpiedFunction<typeof fs.unlink>;
    let alertsSpy: jest.SpiedFunction<typeof alerts.success>;

    beforeEach(() => {
        accessSpy = jest
            .spyOn(fs, "access")
            .mockImplementation((path) =>
                path === existingTypes ||
                path === existingFile ||
                path === outputFolderExistingTypes
                    ? Promise.resolve()
                    : Promise.reject(new Error()),
            );

        unlinkSpy = jest
            .spyOn(fs, "unlink")
            .mockImplementation(() => Promise.resolve());

        alertsSpy = jest
            .spyOn(alerts, "success")
            .mockImplementation(() => null);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("does nothing if types file doesn't exist", async () => {
        const nonExistingFile = path.resolve(__dirname, "..", "deleted.scss");
        const nonExistingTypes = path.join(
            process.cwd(),
            "__tests__/deleted.scss.d.ts",
        );

        await removeSCSSTypeDefinitionFile(nonExistingFile, DEFAULT_OPTIONS);

        expect(accessSpy).toHaveBeenCalledWith(
            expect.stringMatching(nonExistingFile),
            0,
        );
        expect(accessSpy).toHaveBeenCalledWith(
            expect.stringMatching(nonExistingTypes),
            0,
        );
        expect(unlinkSpy).not.toHaveBeenCalled();
        expect(alertsSpy).not.toHaveBeenCalled();
    });

    it("removes *.scss.d.ts types file for *.scss", async () => {
        await removeSCSSTypeDefinitionFile(originalTestFile, DEFAULT_OPTIONS);

        expect(accessSpy).toHaveBeenCalledWith(
            expect.stringMatching(existingTypes),
            0,
        );
        expect(unlinkSpy).toHaveBeenCalled();
        expect(unlinkSpy).toHaveBeenCalledWith(
            expect.stringMatching(existingTypes),
        );
        expect(alertsSpy).toHaveBeenCalled();
    });

    describe("when outputFolder is passed", () => {
        it("removes the correct files", async () => {
            await removeSCSSTypeDefinitionFile(originalTestFile, {
                ...DEFAULT_OPTIONS,
                outputFolder: "__generated__",
            });

            expect(accessSpy).toHaveBeenCalledWith(
                expect.stringMatching(outputFolderExistingTypes),
                0,
            );
            expect(unlinkSpy).toHaveBeenCalled();
            expect(unlinkSpy).toHaveBeenCalledWith(
                expect.stringMatching(outputFolderExistingTypes),
            );
            expect(alertsSpy).toHaveBeenCalled();
        });
    });
});
