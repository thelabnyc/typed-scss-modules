import {jest} from "@jest/globals";
import fs from "node:fs";
import path from "node:path";
import slash from "slash";
import { alerts } from "../lib/core/index.ts";
import { main } from "../lib/main.ts";

import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("main", () => {
  let writeFileSyncSpy: jest.SpiedFunction<typeof fs.writeFileSync>;

  beforeEach(() => {
    // Only mock the writes, so the example files can still be read.
    writeFileSyncSpy = jest.spyOn(fs, "writeFileSync").mockImplementation(() => null);

    // Avoid creating directories while running tests.
    jest.spyOn(fs, "mkdirSync").mockImplementation(() => undefined);

    // Avoid console logs showing up.
    jest.spyOn(console, "log").mockImplementation(() => null);

    jest.spyOn(alerts, "error").mockImplementation(() => null);
  });

  afterEach(() => {
    writeFileSyncSpy.mockReset();
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
    expect(fs.writeFileSync).toHaveBeenCalledTimes(9);

    const expectedDirname = slash(path.join(__dirname, "dummy-styles"));

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      `${expectedDirname}/complex.scss.d.ts`,
      "export declare const nestedAnother: string;\nexport declare const nestedClass: string;\nexport declare const number1: string;\nexport declare const someStyles: string;\nexport declare const whereSelector: string;\n"
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      `${expectedDirname}/style.scss.d.ts`,
      "export declare const someClass: string;\n"
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
    expect(fs.writeFileSync).toHaveBeenCalledTimes(7);

    const expectedDirname = slash(path.join(__dirname, "dummy-styles"));

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      `${expectedDirname}/complex.scss.d.ts`,
      "export declare const nestedAnother: string;\nexport declare const nestedClass: string;\nexport declare const number1: string;\nexport declare const someStyles: string;\nexport declare const whereSelector: string;\n"
    );

    // Files that should match the ignore pattern.
    expect(fs.writeFileSync).not.toHaveBeenCalledWith(
      `${expectedDirname}/style.scss.d.ts`,
      expect.anything()
    );
    expect(fs.writeFileSync).not.toHaveBeenCalledWith(
      `${expectedDirname}/nested-styles/style.scss.d.ts`,
      expect.anything()
    );
  });

  it("reads options from the configuration file", async () => {
    const pattern = `${__dirname}/dummy-styles`;

    jest.spyOn(process, "cwd").mockReturnValue(path.resolve(pattern));

    await main(pattern, {
      additionalData: "$global-red: red;",
      aliases: {
        "~fancy-import": "complex",
        "~another": "style",
      },
      aliasPrefixes: {
        "~": "nested-styles/",
      },
      exportType: "default",
    });

    expect(alerts.error).not.toHaveBeenCalled();
    expect(fs.writeFileSync).toHaveBeenCalledTimes(9);

    // Transform the calls into a more readable format for the snapshot.
    const contents = writeFileSyncSpy.mock.calls
      // @ts-expect-error mock args
      .map(([fullFilePath, contents]: [string, string]) => ({
        path: path.relative(__dirname, fullFilePath),
        contents,
      }))
      // Sort to avoid flakey snapshot tests if call order changes.
      .sort((a, b) => a.path.localeCompare(b.path));

    expect(contents).toMatchSnapshot();
  });

  it("outputs the correct files when outputFolder is passed", async () => {
    const pattern = path.resolve(__dirname, "dummy-styles");

    await main(pattern, {
      additionalData: "$global-red: red;",
      aliases: {
        "~fancy-import": "complex",
        "~another": "style",
      },
      aliasPrefixes: {
        "~": "nested-styles/",
      },
      outputFolder: "__generated__",
    });

    expect(alerts.error).not.toHaveBeenCalled();
    expect(fs.writeFileSync).toHaveBeenCalledTimes(9);
    expect(fs.mkdirSync).toHaveBeenCalledTimes(9);

    // Transform the calls into a more readable format for the snapshot.
    const contents = writeFileSyncSpy.mock.calls
      // @ts-expect-error mock args
      .map(([fullFilePath, contents]: [string, string]) => ({
        path: path.relative(__dirname, fullFilePath),
        contents,
      }))
      // Sort to avoid flakey snapshot tests if call order changes.
      .sort((a, b) => a.path.localeCompare(b.path));

    expect(contents).toMatchSnapshot();
  });
});
