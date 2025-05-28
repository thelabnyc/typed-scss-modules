import path from "node:path";

import { DEFAULT_OPTIONS } from "../../lib/load.ts";
import { getTypeDefinitionPath } from "../../lib/typescript/index.ts";

describe("getTypeDefinitionPath", () => {
    const cssFilePath = path.resolve(process.cwd(), "some/path/style.scss");

    it("returns the type definition path", () => {
        const outputPath = getTypeDefinitionPath(cssFilePath, DEFAULT_OPTIONS);

        expect(outputPath).toEqual(`${cssFilePath}.d.ts`);
    });

    describe("when outputFolder is passed", () => {
        it("returns the type definition path", () => {
            const outputPath = getTypeDefinitionPath(cssFilePath, {
                ...DEFAULT_OPTIONS,
                outputFolder: "__generated__",
            });

            const generatedFilePath = path.resolve(
                process.cwd(),
                "__generated__/some/path/style.scss.d.ts",
            );

            expect(outputPath).toEqual(generatedFilePath);
        });
    });
});
