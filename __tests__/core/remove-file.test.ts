import {jest} from "@jest/globals";
import fs from "node:fs";
import path from "node:path";
import { alerts } from "../../lib/core/alerts.ts";
import { removeSCSSTypeDefinitionFile } from "../../lib/core/remove-file.ts";
import { DEFAULT_OPTIONS } from "../../lib/load.ts";

import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("removeFile", () => {
  const originalTestFile = path.resolve(__dirname, "..", "removable.scss");
  const existingFile = path.resolve(__dirname, "..", "style.scss");
  const existingTypes = path.join(
    process.cwd(),
    "__tests__/removable.scss.d.ts"
  );
  const outputFolderExistingTypes = path.resolve(
    process.cwd(),
    "__generated__/__tests__/removable.scss.d.ts"
  );

  let existsSpy: jest.SpiedFunction<typeof fs.exists>;
  let unlinkSpy: jest.SpiedFunction<typeof fs.unlinkSync>;
  let alertsSpy: jest.SpiedFunction<typeof alerts.success>;

  beforeEach(() => {
    existsSpy = jest
      .spyOn(fs, "existsSync")
      .mockImplementation(
        (path) =>
          path === existingTypes ||
          path === existingFile ||
          path === outputFolderExistingTypes
      );

    unlinkSpy = jest.spyOn(fs, "unlinkSync").mockImplementation(() => null);

    alertsSpy = jest.spyOn(alerts, "success").mockImplementation(() => null);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("does nothing if types file doesn't exist", () => {
    const nonExistingFile = path.resolve(__dirname, "..", "deleted.scss");
    const nonExistingTypes = path.join(
      process.cwd(),
      "__tests__/deleted.scss.d.ts"
    );

    removeSCSSTypeDefinitionFile(nonExistingFile, DEFAULT_OPTIONS);

    expect(existsSpy).toHaveBeenCalledWith(
      expect.stringMatching(nonExistingFile)
    );
    expect(existsSpy).toHaveBeenCalledWith(
      expect.stringMatching(nonExistingTypes)
    );
    expect(unlinkSpy).not.toHaveBeenCalled();
    expect(alertsSpy).not.toHaveBeenCalled();
  });

  it("removes *.scss.d.ts types file for *.scss", () => {
    removeSCSSTypeDefinitionFile(originalTestFile, DEFAULT_OPTIONS);

    expect(existsSpy).toHaveBeenCalledWith(
      expect.stringMatching(existingTypes)
    );
    expect(unlinkSpy).toHaveBeenCalled();
    expect(unlinkSpy).toHaveBeenCalledWith(
      expect.stringMatching(existingTypes)
    );
    expect(alertsSpy).toHaveBeenCalled();
  });

  describe("when outputFolder is passed", () => {
    it("removes the correct files", () => {
      removeSCSSTypeDefinitionFile(originalTestFile, {
        ...DEFAULT_OPTIONS,
        outputFolder: "__generated__",
      });

      expect(existsSpy).toHaveBeenCalledWith(
        expect.stringMatching(outputFolderExistingTypes)
      );
      expect(unlinkSpy).toHaveBeenCalled();
      expect(unlinkSpy).toHaveBeenCalledWith(
        expect.stringMatching(outputFolderExistingTypes)
      );
      expect(alertsSpy).toHaveBeenCalled();
    });
  });
});
